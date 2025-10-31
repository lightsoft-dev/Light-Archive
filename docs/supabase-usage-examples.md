# Supabase 사용 예제

컴포넌트에서 Supabase 데이터를 사용하는 방법입니다.

## 📋 목차

1. [기본 사용법](#기본-사용법)
2. [프로젝트 목록 페이지](#프로젝트-목록-페이지)
3. [프로젝트 상세 페이지](#프로젝트-상세-페이지)
4. [어드민 페이지](#어드민-페이지)
5. [검색 기능](#검색-기능)

---

## 기본 사용법

### Mock 데이터에서 Supabase로 전환

**Before (Mock 데이터):**
```typescript
import { mockProjects } from "@/components/mock/projects"

const projects = mockProjects
```

**After (Supabase):**
```typescript
import { getProjects } from "@/lib/supabase-archive"

const projects = await getProjects()
```

---

## 프로젝트 목록 페이지

### `/app/projects/page.tsx` 수정

```typescript
"use client"

import { useState, useMemo, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { BlogSection, type BlogItem } from "@/components/ui/blog-section"
import { getProjects } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

function ProjectsContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"

  // Supabase에서 데이터 가져오기
  const [projects, setProjects] = useState<Archive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
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

    const categoryMap: Record<string, string[]> = {
      "web": ["Web", "웹 개발", "React", "Next.js", "TypeScript"],
      "internal": ["사내", "시스템", "CRM"],
      "ai": ["AI", "인공지능", "머신러닝", "챗봇", "NLP"],
    }

    const keywords = categoryMap[category]
    if (!keywords) return projects

    return projects.filter((project) => {
      const allText = [
        ...(project.tags || []),
        ...(project.technologies || []),
        project.title,
        project.description,
      ].join(" ").toLowerCase()

      return keywords.some((keyword) =>
        allText.includes(keyword.toLowerCase())
      )
    })
  }, [projects, category])

  // BlogItem 형식으로 변환
  const blogItems: BlogItem[] = filteredProjects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: `/projects/${project.id}`,
    description: project.description || "",
    image: project.image || `https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=640&h=360&fit=crop`,
    createdAt: project.date || "날짜 없음",
    author: "팀",
    readTime: project.difficulty || "5분 읽기",
    viewCount: project.view_count,
    commentCount: project.comment_count,
  }))

  if (loading) {
    return <div className="container mx-auto max-w-5xl px-6 py-12">로딩 중...</div>
  }

  return (
    <div className="container mx-auto max-w-5xl px-6 py-12">
      <BlogSection
        title="프로젝트"
        description="우리 팀의 프로젝트 성과와 결과를 확인하세요"
        blogs={blogItems}
        categoryLabels={{
          all: "전체",
          web: "Web",
          internal: "사내 시스템",
          ai: "AI",
        }}
        currentCategory={category}
        basePath="/projects"
      />
    </div>
  )
}

export default function ProjectsPage() {
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
            <ProjectsContent />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
```

---

## 프로젝트 상세 페이지

### `/components/project-content.tsx` 수정

```typescript
"use client"

import { useEffect, useState } from "react"
import { ArchiveContent } from "@/components/archive-content"
import { RelatedProjectsSection } from "@/components/related-projects-section"
import { getArchiveById, incrementViewCount } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function ProjectContent({ id }: { id?: string }) {
  const [project, setProject] = useState<Archive | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const data = await getArchiveById(id)
        setProject(data)

        // 조회수 증가
        if (data) {
          incrementViewCount(id)
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>프로젝트를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <ArchiveContent
      archive={project}
      ctaButtons={{
        primary: "프로젝트 시작하기",
        secondary: "데모 보기",
      }}
      relatedSection={<RelatedProjectsSection />}
    />
  )
}
```

---

## 어드민 페이지

### `/app/admin/page.tsx` 수정 (일부)

```typescript
"use client"

import { useEffect, useState } from "react"
import { getAllArchives, deleteArchive } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export default function AdminPage() {
  const [archives, setArchives] = useState<Archive[]>([])
  const [loading, setLoading] = useState(true)

  // 데이터 가져오기
  useEffect(() => {
    async function fetchArchives() {
      try {
        const data = await getAllArchives()
        setArchives(data)
      } catch (error) {
        console.error("Failed to fetch archives:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArchives()
  }, [])

  // 삭제 핸들러
  const handleDelete = async (archiveId: string) => {
    const success = await deleteArchive(archiveId)

    if (success) {
      // 로컬 상태 업데이트
      setArchives(archives.filter((archive) => archive.id !== archiveId))
      toast.success("아카이브가 삭제되었습니다")
    } else {
      toast.error("삭제에 실패했습니다")
    }
  }

  // ... 나머지 코드
}
```

### `/app/admin/new/page.tsx` 수정 (저장 부분)

```typescript
import { createArchive } from "@/lib/supabase-archive"

const handleSave = async () => {
  if (!title.trim() || !content.trim()) {
    toast.error("제목과 내용을 입력하세요")
    return
  }

  try {
    const archiveData = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`, // 고유 ID 생성
      title,
      category,
      sub_category: field,
      tags: labels,
      technologies,
      difficulty,
      content,
      author,
      date: new Date().toLocaleDateString("ko-KR"),
      status: "published" as const,
    }

    const result = await createArchive(archiveData)

    if (result) {
      toast.success("아카이브가 저장되었습니다!")
      setTimeout(() => {
        router.push("/admin")
      }, 1000)
    } else {
      toast.error("저장에 실패했습니다")
    }
  } catch (error) {
    console.error("저장 실패:", error)
    toast.error("저장에 실패했습니다")
  }
}
```

---

## 검색 기능

### 검색 컴포넌트 예제

```typescript
"use client"

import { useState } from "react"
import { searchArchives } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function SearchComponent() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Archive[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const data = await searchArchives(query)
      setResults(data)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="검색..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "검색 중..." : "검색"}
      </button>

      <div>
        {results.map((archive) => (
          <div key={archive.id}>
            <h3>{archive.title}</h3>
            <p>{archive.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 관련 아카이브 표시

### Related Projects 수정

```typescript
"use client"

import { useEffect, useState } from "react"
import { getRelatedArchives } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function RelatedProjectsSection({ currentId, tags }: { currentId: string; tags: string[] }) {
  const [related, setRelated] = useState<Archive[]>([])

  useEffect(() => {
    async function fetchRelated() {
      const data = await getRelatedArchives(currentId, tags, 3)
      setRelated(data)
    }

    if (currentId && tags.length > 0) {
      fetchRelated()
    }
  }, [currentId, tags])

  if (related.length === 0) return null

  return (
    <section>
      <h2>관련 프로젝트</h2>
      <div>
        {related.map((archive) => (
          <div key={archive.id}>
            <h3>{archive.title}</h3>
            <p>{archive.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

---

## 💡 팁

### 1. 에러 처리
```typescript
try {
  const data = await getProjects()
  setProjects(data)
} catch (error) {
  console.error("Failed to fetch:", error)
  toast.error("데이터를 불러오는데 실패했습니다")
}
```

### 2. 로딩 상태
```typescript
if (loading) {
  return <Skeleton />
}
```

### 3. 캐싱 (선택사항)
```typescript
// SWR 사용
import useSWR from "swr"

function useProjects() {
  const { data, error } = useSWR("projects", getProjects)
  return {
    projects: data,
    loading: !error && !data,
    error,
  }
}
```

---

## 🚀 다음 단계

1. Mock 데이터 import 제거
2. Supabase 함수로 교체
3. 로딩/에러 상태 추가
4. 테스트

모든 컴포넌트를 한 번에 변경하지 말고, 하나씩 점진적으로 마이그레이션하세요!
