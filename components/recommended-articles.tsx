"use client"

import Link from "next/link"
import { X, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { getRecentArchives } from "@/lib/supabase-archive"
import { getArchiveThumbnail } from "@/lib/utils"
import type { Archive } from "@/types/archive"

export function RecommendedArticles() {
  const [isVisible, setIsVisible] = useState(true)
  const [articles, setArticles] = useState<Archive[]>([])

  useEffect(() => {
    async function fetchArticles() {
      try {
        // 최신 아카이브 5개 가져오기 (모든 카테고리)
        const data = await getRecentArchives(5)
        setArticles(data)
      } catch (error) {
        console.error("Failed to fetch recent archives:", error)
      }
    }
    fetchArticles()
  }, [])

  if (!isVisible || articles.length === 0) return null

  // 카테고리별 링크 생성
  const getCategoryLink = (article: Archive) => {
    if (article.category === "프로젝트") {
      return `/projects/${article.id}`
    } else if (article.category === "기술") {
      return `/skills/${article.id}`
    }
    // 기본값
    return `/projects/${article.id}`
  }

  return (
    <aside className="fixed bottom-6 right-6 w-80 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg z-30 overflow-hidden border border-gray-200/50">
      <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-black">추천 글</h3>
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
        {articles.map((article) => (
          <Link
            key={article.id}
            href={getCategoryLink(article)}
            className="block p-3 hover:bg-gray-50/80 rounded-lg transition-colors group"
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={getArchiveThumbnail(article)}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-black text-white">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {article.date || "최근"}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                {article.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {article.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200/50">
        <Link
          href="/projects"
          className="block text-center text-xs text-gray-600 hover:text-black transition-colors py-1"
        >
          더 많은 글 보기 →
        </Link>
      </div>
    </aside>
  )
}
