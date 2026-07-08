"use client"

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import { X, Plus, ChevronLeft, ChevronRight, Trash2, GalleryHorizontal } from "lucide-react"
import { toast } from "sonner"
import { uploadArchiveImage } from "@/lib/archive-image-upload"
import type { CarouselImage } from "./extensions/image-carousel"

/**
 * 에디터 안에서 보이는 "이미지 슬라이더" 편집 UI.
 *
 * - atom 노드라 내부 텍스트 편집은 없고, 이미지 목록(images 속성)만 다룬다.
 * - 가로 스크롤로 이미지를 나열하고, 각 이미지에 삭제/좌우 이동 버튼을 둔다.
 * - contentEditable={false}로 감싸서 ProseMirror가 내부를 편집하지 않게 한다.
 */
export function ImageCarouselNodeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const images = (node.attrs.images as CarouselImage[]) || []

  // 이미지 추가 (다중 선택 지원)
  const handleAddImages = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      if (files.length === 0) return

      const toastId = toast.loading(`이미지 ${files.length}장 업로드 중...`)
      try {
        const urls = await Promise.all(files.map((f) => uploadArchiveImage(f)))
        const newImages: CarouselImage[] = urls.map((src, i) => ({
          src,
          alt: files[i].name,
        }))
        updateAttributes({ images: [...images, ...newImages] })
        toast.success(`${newImages.length}장 추가되었습니다.`, { id: toastId })
      } catch {
        toast.error("이미지 업로드에 실패했습니다.", { id: toastId })
      }
    }
    input.click()
  }

  // 특정 이미지 삭제
  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index)
    if (next.length === 0) {
      // 이미지가 하나도 없으면 슬라이더 블록 자체를 삭제
      deleteNode()
      return
    }
    updateAttributes({ images: next })
  }

  // 이미지 순서 이동 (좌/우 스왑)
  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateAttributes({ images: next })
  }

  return (
    <NodeViewWrapper
      className={`image-carousel-editor my-4 rounded-lg border-2 transition-colors ${
        selected ? "border-blue-400 bg-blue-50/40" : "border-dashed border-gray-300 bg-gray-50"
      }`}
    >
      <div contentEditable={false} className="p-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <GalleryHorizontal className="h-4 w-4" />
            이미지 슬라이더 · {images.length}장
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddImages}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              title="이미지 추가"
            >
              <Plus className="h-3.5 w-3.5" />
              추가
            </button>
            <button
              type="button"
              onClick={() => deleteNode()}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              title="슬라이더 전체 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          </div>
        </div>

        {/* 이미지 가로 스크롤 목록 */}
        {images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <div
                key={`${img.src}-${i}`}
                className="group relative flex-shrink-0"
                style={{ width: 160 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt || ""}
                  className="h-28 w-40 rounded-md object-cover"
                />

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  title="이미지 삭제"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* 순서 이동 버튼 */}
                <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30"
                    title="왼쪽으로"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(i, 1)}
                    disabled={i === images.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-30"
                    title="오른쪽으로"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 순번 배지 */}
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddImages}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-8 text-sm text-gray-400 hover:bg-gray-100"
          >
            <Plus className="h-5 w-5" />
            이미지를 추가하세요
          </button>
        )}

        <p className="mt-1 text-[11px] text-gray-400">
          조회 화면에서는 좌우로 넘겨보는 슬라이더로 표시됩니다.
        </p>
      </div>
    </NodeViewWrapper>
  )
}
