"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { ArticleContent } from "@/components/article-content"
import { RecommendedArticles } from "@/components/recommended-articles"
import { SearchResults } from "@/components/search-results"
import { Footerdemo } from "@/components/ui/footer-section"
import { getAllArchives } from "@/lib/supabase-archive"
import { searchPosts } from "@/lib/search-utils"
import type { Archive, Post } from "@/types/archive"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 데스크톱에서는 사이드바 열린 상태로 시작
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true)
    }
  }, [])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [archives, setArchives] = useState<Archive[]>([])

  useEffect(() => {
    getAllArchives().then(setArchives)
  }, [])

  // 검색 결과를 메모이제이션하여 성능 최적화
  const searchResults = useMemo(() => {
    return searchPosts(archives, searchQuery)
  }, [archives, searchQuery])

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
    <div className="flex min-h-screen bg-white overflow-hidden">
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
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
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
