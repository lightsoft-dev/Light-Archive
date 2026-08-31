"use client"

/**
 * 에이전트 스킬 카탈로그 목록 (/skills)
 *
 * 기존의 기술 아카이브는 /tech 로 이동했다. 이 경로는 설치 가능한 스킬만 다룬다.
 */

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { SkillCard } from "@/components/skill-card"
import type { SkillCatalogItem } from "@/types/skill"

type VisibilityFilter = "all" | "public" | "internal"
type SortKey = "recent" | "installs"

const SORT_LABELS: Record<SortKey, string> = {
  recent: "최신순",
  installs: "설치 많은 순",
}

const FILTER_LABELS: Record<VisibilityFilter, string> = {
  all: "전체",
  public: "공개",
  internal: "사내 전용",
}

function SkillsCatalog({ searchQuery }: { searchQuery: string }) {
  const searchParams = useSearchParams()
  const filter = (searchParams.get("visibility") || "all") as VisibilityFilter
  const sort = (searchParams.get("sort") || "recent") as SortKey

  const [skills, setSkills] = useState<SkillCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerLoggedIn, setViewerLoggedIn] = useState(false)

  useEffect(() => {
    async function fetchSkills() {
      try {
        // 서버가 세션을 보고 사내 전용 포함 여부를 정한다.
        // 브라우저가 Supabase 를 직접 부르면 그 판정을 우회하게 되므로 API 를 거친다.
        const res = await fetch("/api/skills", { credentials: "same-origin" })
        const body = await res.json()
        setSkills(body.skills || [])
        setViewerLoggedIn(Boolean(body.viewerLoggedIn))
      } catch (error) {
        console.error("Failed to fetch skill catalog:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  const visibleSkills = useMemo(() => {
    const byVisibility =
      filter === "all"
        ? skills
        : skills.filter((skill) => (skill.skill_meta?.visibility ?? "public") === filter)

    const searched = !searchQuery.trim()
      ? byVisibility
      : byVisibility.filter((skill) =>
          [skill.title, skill.description, skill.slug, ...(skill.tags || [])]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )

    if (sort !== "installs") return searched

    // 설치수를 모르는 스킬(사내 전용·아직 색인 전)은 뒤로 보낸다.
    // 0 으로 취급하면 "설치 0회"와 "모름"이 섞여서 순위가 거짓말이 된다.
    return [...searched].sort((a, b) => {
      const av = a.installs ?? -1
      const bv = b.installs ?? -1
      return bv - av
    })
  }, [skills, filter, searchQuery, sort])

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-12 text-gray-500">로딩 중...</div>
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-normal text-black">스킬</h1>
        <p className="mt-3 text-lg text-gray-600">
          팀이 만든 에이전트 스킬입니다. 명령 하나로 설치해서 바로 쓰세요.
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap items-center gap-2">
        {(Object.keys(FILTER_LABELS) as VisibilityFilter[])
          // 로그인하지 않았으면 사내 전용은 결과가 항상 0건이라 탭 자체를 숨긴다
          .filter((key) => key !== "internal" || viewerLoggedIn)
          .map((key) => (
          <Link
            key={key}
            href={(() => {
              const p = new URLSearchParams()
              if (key !== "all") p.set("visibility", key)
              if (sort !== "recent") p.set("sort", sort)
              const q = p.toString()
              return q ? `/skills?${q}` : "/skills"
            })()}
            className={
              filter === key
                ? "rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
                : "rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-black hover:text-black"
            }
          >
            {FILTER_LABELS[key]}
          </Link>
        ))}

        <span className="mx-1 h-4 w-px bg-gray-200" aria-hidden />

        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
          const params = new URLSearchParams()
          if (filter !== "all") params.set("visibility", filter)
          if (key !== "recent") params.set("sort", key)
          const query = params.toString()
          return (
            <Link
              key={key}
              href={query ? `/skills?${query}` : "/skills"}
              className={
                sort === key
                  ? "rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-black"
                  : "rounded-full px-4 py-2 text-sm text-gray-500 transition-colors hover:text-black"
              }
            >
              {SORT_LABELS[key]}
            </Link>
          )
        })}
      </nav>

      {visibleSkills.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          {searchQuery.trim() ? "검색 결과가 없습니다." : "아직 등록된 스킬이 없습니다."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SkillsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearchChange={setSearchQuery} />
        <main className="flex-1">
          <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-12 text-gray-500">로딩 중...</div>}>
            <SkillsCatalog searchQuery={searchQuery} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
