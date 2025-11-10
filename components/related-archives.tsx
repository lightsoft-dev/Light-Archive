"use client"

import Link from "next/link"
import { X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { getRelatedArchives } from "@/lib/supabase-archive"
import { getArchiveThumbnail } from "@/lib/utils"
import type { Archive } from "@/types/archive"

interface RelatedArchivesProps {
  currentArchive: Archive
}

/**
 * 관련 아카이브를 표시하는 컴포넌트
 * - 같은 카테고리, 태그, 기술 스택을 기반으로 유사한 아카이브 추천
 * - 프로젝트/스킬 상세 페이지에서 사용
 */
export function RelatedArchives({ currentArchive }: RelatedArchivesProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [relatedItems, setRelatedItems] = useState<Archive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      try {
        setLoading(true)
        // 관련 아카이브 가져오기 (최대 5개)
        const data = await getRelatedArchives(currentArchive, 5)
        setRelatedItems(data)
      } catch (error) {
        console.error("Failed to fetch related archives:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentArchive) {
      fetchRelated()
    }
  }, [currentArchive])

  if (!isVisible || loading || relatedItems.length === 0) return null

  // 카테고리별 링크 생성
  const getCategoryLink = (archive: Archive) => {
    if (archive.category === "프로젝트") {
      return `/projects/${archive.id}`
    } else if (archive.category === "기술") {
      return `/skills/${archive.id}`
    }
    return `/projects/${archive.id}`
  }

  return (
    <aside className="fixed bottom-6 right-6 w-80 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg z-30 overflow-hidden border border-gray-200/50">
      <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-black">관련 아카이브</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-gray-100/50 rounded-md transition-colors"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
        {relatedItems.map((item) => (
          <Link
            key={item.id}
            href={getCategoryLink(item)}
            className="block p-3 hover:bg-gray-50/80 rounded-lg transition-colors group"
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={getArchiveThumbnail(item)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-black text-white">
                    {item.category}
                  </span>
                  {item.difficulty && (
                    <span className="text-[10px] text-gray-500">
                      {item.difficulty}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h4>
                {/* 관련 태그 표시 */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200/50">
        <Link
          href={currentArchive.category === "프로젝트" ? "/projects" : "/skills"}
          className="block text-center text-xs text-gray-600 hover:text-black transition-colors py-1"
        >
          {currentArchive.category} 더 보기 →
        </Link>
      </div>
    </aside>
  )
}
