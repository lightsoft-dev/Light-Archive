"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { getProjects } from "@/lib/supabase-archive"
import { getCommentCounts } from "@/lib/supabase-comments"
import { getArchiveThumbnail } from "@/lib/utils"
import type { Archive } from "@/types/archive"
import { BlogSection, type BlogItem } from "@/components/ui/blog-section"

function ProjectsContent({ searchQuery }: { searchQuery: string }) {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"

  // Supabase에서 데이터 가져오기
  const [projects, setProjects] = useState<Archive[]>([])
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
        const ids = data.map((p) => p.id)
        const counts = await getCommentCounts(ids)
        setCommentCounts(counts)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // 카테고리별 필터링
  const filteredProjects = useMemo(() => {
    if (category === "all") return projects
    
    // 카테고리 매핑 (tags 기반으로 필터링)
    const categoryMap: Record<string, string[]> = {
      "web": ["Web", "웹 개발", "React", "Next.js", "TypeScript"],
      "internal": ["사내", "시스템", "CRM"],
      "ai": ["AI", "인공지능", "머신러닝", "챗봇", "NLP"],
    }
    
    const keywords = categoryMap[category]
    if (!keywords) return projects

    return projects.filter((project) => {
      // tags나 technologies에서 키워드 검색
      const allText = [
        ...(project.tags || []),
        ...(project.technologies || []),
        project.title,
        project.description || "",
      ].join(" ").toLowerCase()

      return keywords.some((keyword) =>
        allText.includes(keyword.toLowerCase())
      )
    })
  }, [projects, category])

  // 검색 필터링
  const searchedProjects = useMemo(() => {
    if (!searchQuery.trim()) return filteredProjects
    const q = searchQuery.toLowerCase()
    return filteredProjects.filter((project) => {
      const text = [
        project.title,
        project.description || "",
        ...(project.tags || []),
      ].join(" ").toLowerCase()
      return text.includes(q)
    })
  }, [filteredProjects, searchQuery])

  // 프로젝트 데이터를 BlogItem 형식으로 변환
  const blogItems: BlogItem[] = searchedProjects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: `/projects/${project.id}`,
    description: project.description || "",
    image: getArchiveThumbnail(project),
    createdAt: project.date || "",
    author: project.author || "팀",
    readTime: project.difficulty || "5분 읽기",
    viewCount: project.view_count,
    commentCount: commentCounts[project.id] || 0,
  }))

  if (loading) {
    return <div className="container mx-auto max-w-5xl px-6 py-12">로딩 중...</div>
  }

  const categoryLabels: Record<string, string> = {
    all: "전체",
    "web": "Web",
    "internal": "사내 시스템",
    "ai": "AI",
  }

  return (
    <div className="w-full mx-auto max-w-5xl py-12">
      <BlogSection
        title="프로젝트"
        description="우리 팀의 프로젝트 성과와 결과를 확인하세요"
        blogs={blogItems}
        categoryLabels={categoryLabels}
        currentCategory={category}
        basePath="/projects"
      />
    </div>
  )
}

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearchChange={setSearchQuery} />

        <main className="flex-1">
          <Suspense fallback={<div className="container mx-auto max-w-5xl px-6 py-12">로딩 중...</div>}>
            <ProjectsContent searchQuery={searchQuery} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

