"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { RelatedArchives } from "@/components/related-archives"
import { useState, useEffect, type ReactNode } from "react"
import { getArchiveById } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

interface ArchiveLayoutProps {
  children: ReactNode
  archiveId: string // 현재 보고 있는 아카이브 ID
}

/**
 * 아카이브 상세 페이지의 공통 레이아웃
 * - Sidebar, TopNav, RelatedArchives 섹션을 포함
 * - Projects와 Skills 페이지에서 공통으로 사용
 */
export function ArchiveLayout({ children, archiveId }: ArchiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentArchive, setCurrentArchive] = useState<Archive | null>(null)

  useEffect(() => {
    async function fetchCurrentArchive() {
      const archive = await getArchiveById(archiveId)
      setCurrentArchive(archive)
    }

    if (archiveId) {
      fetchCurrentArchive()
    }
  }, [archiveId])

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
          {currentArchive && <RelatedArchives currentArchive={currentArchive} />}
        </main>
      </div>
    </div>
  )
}
