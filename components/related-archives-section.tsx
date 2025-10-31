"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getRelatedArchives } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

interface RelatedArchivesSectionProps {
  currentArchive: Archive
}

/**
 * 페이지 하단에 표시되는 관련 아카이브 섹션
 * - 현재 아카이브와 관련된 콘텐츠를 추천
 * - 태그, 기술 스택 기반의 스마트 추천
 */
export function RelatedArchivesSection({ currentArchive }: RelatedArchivesSectionProps) {
  const [relatedItems, setRelatedItems] = useState<Archive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      try {
        setLoading(true)
        // 관련 아카이브 4개 가져오기 (하단 섹션은 조금 적게)
        const related = await getRelatedArchives(currentArchive, 4)
        setRelatedItems(related)
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

  if (loading) {
    return (
      <div className="mt-16 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500">관련 아카이브를 불러오는 중...</p>
      </div>
    )
  }

  if (relatedItems.length === 0) return null

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
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-normal text-black">관련 아카이브</h2>
        <Link
          href={currentArchive.category === "프로젝트" ? "/projects" : "/skills"}
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedItems.map((item) => (
          <Link
            key={item.id}
            href={getCategoryLink(item)}
            className="group block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={item.image || item.thumbnail_url || `https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=640&h=360&fit=crop`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-black text-white rounded-full">
                    {item.category}
                  </span>
                  {item.difficulty && (
                    <span className="text-xs text-gray-500">
                      {item.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-medium text-black mb-1 group-hover:text-gray-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description || ""}
                </p>
                {/* 공통 태그 표시 */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.tags.slice(0, 3).map((tag, index) => {
                      // 현재 아카이브와 겹치는 태그는 강조
                      const isCommon = currentArchive.tags?.includes(tag)
                      return (
                        <span
                          key={index}
                          className={`text-xs px-2 py-0.5 rounded ${
                            isCommon
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
