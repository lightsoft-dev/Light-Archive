"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { ArticleContent } from "@/components/article-content"
import { RecommendedArticles } from "@/components/recommended-articles"
import { SearchResults } from "@/components/search-results"
import { Footerdemo } from "@/components/ui/footer-section"
import { mockPosts } from "@/components/mock/posts"
import { searchPosts } from "@/lib/search-utils"
import { Post } from "@/types/archive"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // 검색 결과를 메모이제이션하여 성능 최적화
  const searchResults = useMemo(() => {
    return searchPosts(mockPosts, searchQuery)
  }, [searchQuery])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    // 검색 시 선택된 포스트 초기화
    if (query.trim()) {
      setSelectedPost(null)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedPost(null)
  }

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post)
    setSearchQuery("") // 검색 결과 닫기
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300">
        <TopNav
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearchChange={handleSearchChange}
        />

        {/* 검색 결과 표시 */}
        {searchQuery && (
          <SearchResults
            query={searchQuery}
            results={searchResults}
            onClear={handleClearSearch}
            onSelectPost={handleSelectPost}
          />
        )}

        <main className="flex-1">
          <ArticleContent selectedPost={selectedPost} />
        </main>
        <Footerdemo />
      </div>

      {/* Recommended Articles Floating */}
      <RecommendedArticles />
    </div>
  )
}
