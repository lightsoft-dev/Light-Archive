"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Archive } from "@/types/archive"
import type { ReactNode } from "react"

interface ArchiveContentProps {
  archive: Archive
  ctaButtons?: {
    primary: string
    secondary: string
  }
  relatedSection?: ReactNode
}

/**
 * 아카이브 상세 콘텐츠를 표시하는 공통 컴포넌트
 * - Projects, Skills 등 모든 아카이브 타입에서 재사용
 * - CTA 버튼과 관련 섹션은 커스터마이징 가능
 */
export function ArchiveContent({ archive, ctaButtons, relatedSection }: ArchiveContentProps) {
  const router = useRouter()

  const defaultCtaButtons = {
    primary: "시작하기",
    secondary: "더 알아보기"
  }

  const buttons = ctaButtons || defaultCtaButtons

  const handleBack = () => {
    router.back()
  }

  return (
    <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        이전으로
      </button>

      {/* Date */}
      <div className="text-sm text-gray-500 mb-6">
        {archive.date || "날짜 없음"} · {archive.subCategory || archive.category}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
        {archive.title}
      </h1>

      {/* Categories Section with Stats */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-4">카테고리</h3>
            {archive.tags && archive.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {archive.tags.map((tag, index) => (
                  <Badge key={index} className="bg-black text-white border-transparent" size="md">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {/* Stats */}
          {(archive.difficulty || archive.viewCount !== undefined || archive.commentCount !== undefined) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {archive.difficulty && (
                <>
                  <div>
                    <span className="font-medium">난이도:</span> {archive.difficulty}
                  </div>
                  {(archive.viewCount !== undefined || archive.commentCount !== undefined) && (
                    <span className="text-gray-300">·</span>
                  )}
                </>
              )}
              {archive.viewCount !== undefined && (
                <>
                  <div>
                    <span className="font-medium">조회수:</span> {archive.viewCount.toLocaleString()}
                  </div>
                  {archive.commentCount !== undefined && (
                    <span className="text-gray-300">·</span>
                  )}
                </>
              )}
              {archive.commentCount !== undefined && (
                <div>
                  <span className="font-medium">댓글:</span> {archive.commentCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium">
          {buttons.primary}
        </Button>
        <button className="flex items-center gap-2 text-sm text-black hover:underline">
          {buttons.secondary}
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Archive Image */}
      {archive.image && (
        <div className="mb-16 bg-gray-100 rounded-2xl overflow-hidden">
          <div className="aspect-video">
            <img src={archive.image} alt={archive.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      {archive.content ? (
        <div
          className="space-y-8 [&_p]:text-lg [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-normal [&_h2]:text-black [&_h2]:mb-6 [&_h2]:mt-12 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:mb-2 [&_li]:text-gray-700 [&_strong]:font-bold [&_strong]:text-black [&_div]:my-12 [&_div]:rounded-2xl [&_div]:overflow-hidden [&_img]:w-full [&_img]:h-auto"
          dangerouslySetInnerHTML={{ __html: archive.content }}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {archive.description}
          </p>
        </div>
      )}

      {/* Related Section */}
      {relatedSection}
    </article>
  )
}
