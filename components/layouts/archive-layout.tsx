"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { useState, useEffect, type ReactNode } from "react"
import { getArchiveById } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

interface ArchiveLayoutProps {
  children: ReactNode
  archiveId: string // 현재 보고 있는 아카이브 ID
}

/**
 * 아카이브 상세 페이지의 공통 레이아웃
 * - Sidebar 와 TopNav 를 포함한다.
 *   관련 항목은 본문 하단(ArchiveContent 의 relatedSection)에 있다 —
 *   예전에는 우하단 플로팅 패널로도 같은 내용을 띄웠는데 본문과 겹치고
 *   "관련 아카이브" 헤딩이 화면에 두 번 나와서 걷어냈다.
 * - Projects와 Skills 페이지에서 공통으로 사용
 */
export function ArchiveLayout({ children, archiveId }: ArchiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentArchive, setCurrentArchive] = useState<Archive | null>(null)

  // 데스크톱에서는 사이드바 열린 상태로 시작
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

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
    <div className="flex min-h-screen bg-white overflow-hidden">
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

      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  )
}
