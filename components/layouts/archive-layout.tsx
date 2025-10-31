"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { RelatedProjects } from "@/components/related-projects"
import { useState, type ReactNode } from "react"

interface ArchiveLayoutProps {
  children: ReactNode
}

/**
 * 아카이브 상세 페이지의 공통 레이아웃
 * - Sidebar, TopNav, RelatedProjects 섹션을 포함
 * - Projects와 Skills 페이지에서 공통으로 사용
 */
export function ArchiveLayout({ children }: ArchiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col transition-all duration-300">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 relative">
          {children}
          <RelatedProjects />
        </main>
      </div>
    </div>
  )
}
