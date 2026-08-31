"use client"

/**
 * Sidebar + TopNav 를 두르는 껍데기
 *
 * 스킬 상세는 서버 컴포넌트로 렌더해야 SEO 에 유리한데 Sidebar/TopNav 는 클라이언트다.
 * 그래서 껍데기만 클라이언트로 두고 본문은 children 으로 받는다(서버 렌더 유지).
 */

import { useEffect, useState, type ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"

export function CatalogShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
