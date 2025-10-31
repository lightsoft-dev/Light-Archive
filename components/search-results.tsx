"use client"

import { Post } from "@/types/archive"
import { Search, X } from "lucide-react"

interface SearchResultsProps {
  query: string
  results: Post[]
  onClear: () => void
  onSelectPost: (post: Post) => void
}

export function SearchResults({ query, results, onClear, onSelectPost }: SearchResultsProps) {
  if (!query) return null

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6">
        {/* 검색 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Search className="w-4 h-4" />
            <span>
              '<span className="font-medium text-black">{query}</span>' 검색 결과
              <span className="ml-2 text-gray-400">({results.length}개)</span>
            </span>
          </div>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
            닫기
          </button>
        </div>

        {/* 검색 결과 */}
        {results.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400">다른 검색어를 시도해보세요</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {results.map((post) => (
              <button
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="w-full text-left p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                {/* 제목 */}
                <h3 className="font-medium text-black mb-2 line-clamp-1">{post.title}</h3>

                {/* 설명 */}
                {post.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                )}

                {/* 메타 정보 */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">{post.category}</span>
                  {post.date && <span>{post.date}</span>}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
