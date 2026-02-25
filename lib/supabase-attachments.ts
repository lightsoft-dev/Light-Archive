/**
 * Supabase Storage 기반 첨부파일 관리
 * 별도 DB 테이블 없이 Storage의 폴더 구조로 관리
 *
 * 경로 구조: thumbnails/attachments/{archiveId}/{파일명}
 */

import { supabase } from "./supabase"
import type { Attachment } from "@/types/archive"

const BUCKET = "thumbnails"
const ATTACHMENTS_PATH = "attachments"

/**
 * 파일 업로드
 * - archiveId 폴더 하위에 파일을 업로드
 * - 동일 파일명 충돌 방지를 위해 타임스탬프 접두사 추가
 */
export async function uploadAttachment(
  archiveId: string,
  file: File
): Promise<Attachment | null> {
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, "_")
  const storagePath = `${ATTACHMENTS_PATH}/${archiveId}/${timestamp}-${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file)

  if (error) {
    console.error("파일 업로드 실패:", error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)

  return {
    name: file.name,
    url: urlData.publicUrl,
    size: file.size,
    type: file.type,
  }
}

/**
 * 아카이브의 모든 첨부파일 목록 조회
 * - Storage 폴더를 리스트하여 파일 정보 반환
 */
export async function getAttachments(archiveId: string): Promise<Attachment[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${ATTACHMENTS_PATH}/${archiveId}`)

  if (error) {
    console.error("첨부파일 목록 조회 실패:", error)
    return []
  }

  if (!data || data.length === 0) return []

  return data
    .filter((file) => file.name !== ".emptyFolderPlaceholder")
    .map((file) => {
      const storagePath = `${ATTACHMENTS_PATH}/${archiveId}/${file.name}`
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

      // 타임스탬프 접두사 제거하여 원본 파일명 복원
      // 형식: {timestamp}-{originalName}
      const originalName = file.name.replace(/^\d+-/, "")

      return {
        name: originalName,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "",
      }
    })
}

/**
 * 첨부파일 삭제
 * - URL에서 Storage 경로를 추출하여 삭제
 */
export async function deleteAttachment(
  archiveId: string,
  fileUrl: string
): Promise<boolean> {
  // Public URL에서 storage 경로 추출
  const urlParts = fileUrl.split(`/object/public/${BUCKET}/`)
  if (urlParts.length < 2) {
    console.error("잘못된 파일 URL:", fileUrl)
    return false
  }

  const storagePath = decodeURIComponent(urlParts[1])

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) {
    console.error("첨부파일 삭제 실패:", error)
    return false
  }

  return true
}

/**
 * 아카이브의 모든 첨부파일 삭제
 * - 아카이브 삭제 시 호출
 */
export async function deleteAllAttachments(archiveId: string): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${ATTACHMENTS_PATH}/${archiveId}`)

  if (error || !data) return false

  const filePaths = data.map(
    (file) => `${ATTACHMENTS_PATH}/${archiveId}/${file.name}`
  )

  if (filePaths.length === 0) return true

  const { error: deleteError } = await supabase.storage
    .from(BUCKET)
    .remove(filePaths)

  if (deleteError) {
    console.error("전체 첨부파일 삭제 실패:", deleteError)
    return false
  }

  return true
}

/**
 * 파일 크기를 읽기 좋은 형식으로 변환
 * 예: 1024 → "1.0 KB", 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

/**
 * 파일 타입에 따른 아이콘 이름 반환
 */
export function getFileIconType(
  fileType: string
): "image" | "pdf" | "document" | "spreadsheet" | "code" | "file" {
  if (fileType.startsWith("image/")) return "image"
  if (fileType === "application/pdf") return "pdf"
  if (
    fileType.includes("word") ||
    fileType.includes("document") ||
    fileType.includes("text/")
  )
    return "document"
  if (fileType.includes("sheet") || fileType.includes("excel"))
    return "spreadsheet"
  if (
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("html") ||
    fileType.includes("css")
  )
    return "code"
  return "file"
}
