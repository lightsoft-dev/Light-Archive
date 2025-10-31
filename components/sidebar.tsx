"use client"

import Link from "next/link"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  return (
    <>
      {/* Toggle button when sidebar is closed (desktop only) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 hidden lg:flex p-2 hover:bg-gray-100/50 rounded-md transition-colors bg-white/40 backdrop-blur-xl"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 z-40
          bg-white/40 backdrop-blur-2xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/가로logo.png" alt="Lightsoft" className="h-12" />
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={onToggle} className="hidden lg:flex p-2 hover:bg-gray-100/50 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100/50 rounded-md transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm font-medium text-gray-900">리서치</div>
            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
              안전
            </div>
            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
              비즈니스용
            </div>

            <div className="pt-4">
              <div className="px-3 py-2 text-sm font-medium text-gray-900">개발자</div>
            </div>

            <Link
              href="/"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
            >
              ChatGPT
            </Link>
            <Link
              href="/projects/ai-content"
              className="block px-3 py-2 text-sm text-gray-900 bg-gray-100/70 rounded-md cursor-pointer font-medium"
            >
              AI 콘텐츠 생성
            </Link>
            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
              Sora
            </div>

            <div className="pt-4">
              <div className="px-3 py-2 text-sm font-medium text-gray-900">스토리</div>
            </div>

            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
              회사
            </div>
            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
              뉴스
            </div>

            <div className="pt-4">
              <div className="px-3 py-2 text-sm font-medium text-gray-900">관리</div>
            </div>

            <Link
              href="/admin"
              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
            >
              관리자 페이지
            </Link>
          </div>
        </nav>
      </aside>
    </>
  )
}
