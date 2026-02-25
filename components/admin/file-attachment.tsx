"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, X, FileText, FileImage, File, FileCode, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  uploadAttachment,
  deleteAttachment,
  formatFileSize,
  getFileIconType,
} from "@/lib/supabase-attachments"
import type { Attachment } from "@/types/archive"

// 최대 파일 크기: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

interface FileAttachmentProps {
  archiveId: string
  attachments: Attachment[]
  onChange: (attachments: Attachment[]) => void
}

/**
 * 파일 첨부 컴포넌트
 * - 드래그 앤 드롭 또는 클릭으로 여러 파일 업로드
 * - 업로드된 파일 목록 표시 (이름, 크기, 삭제 버튼)
 * - Supabase Storage에 즉시 업로드
 */
export function FileAttachment({ archiveId, attachments, onChange }: FileAttachmentProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)

      // 파일 크기 검증
      const oversizedFiles = fileArray.filter((f) => f.size > MAX_FILE_SIZE)
      if (oversizedFiles.length > 0) {
        toast.error(
          `${oversizedFiles.map((f) => f.name).join(", ")} 파일이 50MB를 초과합니다`
        )
        return
      }

      // 업로드 중 표시
      const fileNames = fileArray.map((f) => f.name)
      setUploadingFiles((prev) => [...prev, ...fileNames])

      // 병렬 업로드
      const results = await Promise.all(
        fileArray.map((file) => uploadAttachment(archiveId, file))
      )

      // 업로드 완료 처리
      const successFiles = results.filter(Boolean) as Attachment[]
      const failCount = results.filter((r) => r === null).length

      if (successFiles.length > 0) {
        onChange([...attachments, ...successFiles])
        toast.success(`${successFiles.length}개 파일이 업로드되었습니다`)
      }

      if (failCount > 0) {
        toast.error(`${failCount}개 파일 업로드에 실패했습니다`)
      }

      setUploadingFiles((prev) =>
        prev.filter((name) => !fileNames.includes(name))
      )
    },
    [archiveId, attachments, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDelete = async (attachment: Attachment) => {
    const success = await deleteAttachment(archiveId, attachment.url)
    if (success) {
      onChange(attachments.filter((a) => a.url !== attachment.url))
      toast.success(`${attachment.name} 파일이 삭제되었습니다`)
    } else {
      toast.error("파일 삭제에 실패했습니다")
    }
  }

  const FileIcon = ({ type }: { type: string }) => {
    const iconType = getFileIconType(type)
    const className = "w-5 h-5 text-gray-500"
    switch (iconType) {
      case "image":
        return <FileImage className={className} />
      case "pdf":
        return <FileText className={`${className} text-red-500`} />
      case "document":
        return <FileText className={className} />
      case "code":
        return <FileCode className={className} />
      default:
        return <File className={className} />
    }
  }

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
        `}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-400 mt-1">
          최대 50MB · 여러 파일 선택 가능
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
            e.target.value = "" // 같은 파일 재선택 가능하도록 초기화
          }
        }}
      />

      {/* 업로드 중인 파일 */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((name) => (
            <div
              key={name}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse"
            >
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-sm text-gray-600 flex-1 truncate">
                {name} 업로드 중...
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.url}
              className="flex items-center gap-3 p-3 bg-white border rounded-lg group"
            >
              <FileIcon type={attachment.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(attachment)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
