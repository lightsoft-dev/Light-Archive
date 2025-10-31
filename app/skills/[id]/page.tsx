"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { SkillContent } from "@/components/skill-content"
import { RelatedProjects } from "@/components/related-projects"
import { useState } from "react"
import { useParams } from "next/navigation"

export default function SkillPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const params = useParams()
  const id = params?.id as string

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

      <div className="flex-1 flex flex-col">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 relative">
          <SkillContent id={id} />
          <RelatedProjects />
        </main>
      </div>
    </div>
  )
}

