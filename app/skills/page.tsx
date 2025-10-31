"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { mockSkills } from "@/components/mock/skills"
import { BlogSection, type BlogItem } from "@/components/ui/blog-section"

function SkillsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"

  // 카테고리별 필터링
  const filteredSkills = useMemo(() => {
    if (category === "all") return mockSkills

    // 카테고리 매핑
    const categoryMap: Record<string, string> = {
      "cloud-code": "클로드 코드",
      "ai": "인공지능 활용",
    }

    const targetCategory = categoryMap[category]
    if (!targetCategory) return mockSkills

    return mockSkills.filter((skill) => skill.subCategory === targetCategory)
  }, [category])

  // 스킬 데이터를 BlogItem 형식으로 변환
  const blogItems: BlogItem[] = filteredSkills.map((skill) => ({
    id: skill.id,
    title: skill.title,
    slug: `/skills/${skill.id}`,
    description: skill.description,
    image: skill.image || `https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=640&h=360&fit=crop`,
    createdAt: skill.date || "날짜 없음",
    author: "팀",
    readTime: skill.difficulty || "5분 읽기",
    viewCount: skill.viewCount,
    commentCount: skill.commentCount,
  }))

  const categoryLabels: Record<string, string> = {
    all: "전체",
    "cloud-code": "클로드 코드",
    "ai": "인공지능 활용",
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <BlogSection
        title="기술"
        description="기술 문서와 가이드를 확인하세요"
        blogs={blogItems}
        categoryLabels={categoryLabels}
        currentCategory={category}
        basePath="/skills"
      />
    </div>
  )
}

export default function SkillsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-white">
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

      <div className="flex-1 flex flex-col">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1">
          <Suspense fallback={<div className="container mx-auto max-w-5xl px-6 py-12">로딩 중...</div>}>
            <SkillsContent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

