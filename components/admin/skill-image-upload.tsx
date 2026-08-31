"use client"

/**
 * 스킬 이미지 업로드
 *
 * 두 가지로 쓴다:
 *  - mode="thumbnail" : 목록 카드에 쓸 대표 이미지. 미리보기와 제거 버튼이 붙는다.
 *  - mode="clipboard" : demo·code 섹션 JSON 에 붙여넣을 URL 을 얻는 용도.
 *    섹션마다 업로드 UI 를 두는 대신 하나로 모아두고 URL 을 복사하게 했다 —
 *    어느 섹션에 넣을지는 JSON 을 직접 고치는 쪽이 자유롭다.
 */

import { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface Props {
  slug: string
  mode: "thumbnail" | "clipboard"
  value?: string | null
  onChange?: (url: string | null) => void
}

export function SkillImageUpload({ slug, mode, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function upload(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("slug", slug)

      const res = await fetch("/api/skills/assets", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      })
      const body = await res.json()
      if (!res.ok || !body.ok) throw new Error(body.error || "업로드 실패")

      if (mode === "thumbnail") {
        onChange?.(body.url)
        toast.success("대표 이미지가 올라갔습니다")
      } else {
        await navigator.clipboard.writeText(body.url)
        toast.success("URL을 복사했습니다. 섹션 JSON에 붙여넣으세요")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "업로드 실패")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  if (mode === "thumbnail") {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />

        {value ? (
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <div className="aspect-[16/9] bg-gray-100">
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onChange?.(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
              aria-label="이미지 제거"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            disabled={uploading}
            className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 transition-colors hover:border-black hover:text-black disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span>클릭하거나 이미지를 끌어다 놓으세요</span>
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4"
        hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        이미지 업로드 → URL 복사
      </button>
    </>
  )
}
