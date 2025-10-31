"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { ArticleContent } from "@/components/article-content"
import { RelatedProjects } from "@/components/related-projects"
import { Footerdemo } from "@/components/ui/footer-section"

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        <TopNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1">
          <ArticleContent />
        </main>
        <Footerdemo />
      </div>

      {/* Related Projects Floating */}
      <RelatedProjects />
    </div>
  )
}
