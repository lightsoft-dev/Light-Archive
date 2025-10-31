"use client"

import { useState } from "react"
import { Search, Menu, X } from "lucide-react"

interface TopNavProps {
  onMenuClick: () => void
  onSearchChange?: (query: string) => void
}

export function TopNav({ onMenuClick, onSearchChange }: TopNavProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isSearchOpen) {
      // 검색 모드 닫을 때 초기화
      setSearchQuery("")
      onSearchChange?.("")
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    onSearchChange?.("")
  }

  return (
    <header className="bg-white/40 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4 px-8 py-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100/50 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1" />

        {/* 검색 영역 */}
        <div className="flex items-center gap-2">
          {/* 검색 입력 필드 */}
          {isSearchOpen && (
            <div className="relative animate-in fade-in slide-in-from-right-2 duration-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="제목, 설명, 태그로 검색..."
                className="w-64 md:w-80 pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* 검색 토글 버튼 */}
          <button
            onClick={handleSearchToggle}
            className="p-2 hover:bg-gray-100/50 rounded-md transition-colors"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Search className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
