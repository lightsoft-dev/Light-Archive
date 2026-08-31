"use client"

/**
 * 스킬 섹션 편집 (/admin/skills/{slug})
 *
 * 스킬은 보통 에이전트가 API 로 게시한다. 이 화면은 그렇게 올라온 것을 사람이 다듬는 자리다.
 * 왼쪽에서 고치고 오른쪽에서 바로 결과를 본다 — 저장하고 새 탭에서 확인하는 왕복을 없애려는 것.
 */

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Save } from "lucide-react"
import { toast } from "sonner"

import { SkillSectionsEditor } from "@/components/admin/skill-sections-editor"
import { SkillSectionRenderer } from "@/components/skill-sections"
import { checkSession, fetchAdminArchives, updateAdminArchive } from "@/lib/admin-api"
import type { SkillSection } from "@/lib/skill-sections"
import type { SkillCatalogItem, SkillVisibility } from "@/types/skill"

export default function SkillEditPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()

  const [skill, setSkill] = useState<SkillCatalogItem | null>(null)
  const [sections, setSections] = useState<SkillSection[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<SkillVisibility>("public")
  const [status, setStatus] = useState<string>("draft")
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!(await checkSession())) {
        toast.error("관리자 로그인이 필요합니다")
        router.push("/admin")
        return
      }

      try {
        // slug 로 단건 조회하는 관리자 엔드포인트는 아직 없다.
        // 아카이브가 수십 건 규모라 목록에서 찾는 편이 엔드포인트를 늘리는 것보다 싸다.
        const all = await fetchAdminArchives()
        // Archive 타입에는 slug 가 없다(스킬 전용 컬럼). 런타임에는 들어 있으므로
        // unknown 을 거쳐 좁힌다.
        const found = (all as unknown as SkillCatalogItem[]).find((a) => a.slug === slug)

        if (!found) {
          toast.error(`'${slug}' 스킬을 찾을 수 없습니다`)
          router.push("/admin")
          return
        }

        setSkill(found)
        setSections((found.sections as SkillSection[]) || [])
        setTitle(found.title)
        setDescription(found.description || "")
        setVisibility(found.skill_meta?.visibility ?? "public")
        setStatus(found.status || "draft")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "불러오지 못했습니다")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, router])

  const hasBrokenJson = useMemo(() => sections.some((s) => s?.data === undefined), [sections])

  async function handleSave(nextStatus?: string) {
    if (!skill) return
    setSaving(true)
    setIssues([])

    try {
      await updateAdminArchive(skill.id, {
        title,
        description,
        status: nextStatus ?? status,
        sections,
        skill_meta: { ...(skill.skill_meta ?? {}), visibility },
      })
      if (nextStatus) setStatus(nextStatus)
      toast.success(nextStatus === "published" ? "발행되었습니다" : "저장되었습니다")
    } catch (error) {
      // 서버가 스키마 위반을 issues 로 돌려주면 카드에 표시한다
      const message = error instanceof Error ? error.message : "저장 실패"
      toast.error(message)
      try {
        const res = await fetch(`/api/admin/archives/${skill.id}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections }),
        })
        const body = await res.json()
        if (body?.issues) setIssues(body.issues)
      } catch {
        // 위 요청은 오류 상세를 얻기 위한 것뿐이라 실패해도 무시한다
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-12 text-gray-500">불러오는 중...</div>
  }
  if (!skill) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 transition-colors hover:text-black">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-medium text-black">{skill.slug}</h1>
              <p className="text-xs text-gray-500">
                {status === "published" ? "발행됨" : "임시저장"} · 섹션 {sections.length}개
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/skills/${skill.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-black hover:text-black"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              실제 페이지
            </a>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || hasBrokenJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-black hover:text-black disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              저장
            </button>
            {status !== "published" && (
              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={saving || hasBrokenJson}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
              >
                발행
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-2">
        {/* 편집 */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">
                한 줄 설명 <span className="font-normal text-gray-400">목록 카드에 노출됩니다</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-black">공개 범위</label>
              <div className="flex gap-2">
                {(["public", "internal"] as SkillVisibility[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={
                      visibility === v
                        ? "rounded-full bg-black px-4 py-1.5 text-sm text-white"
                        : "rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:border-black"
                    }
                  >
                    {v === "public" ? "공개" : "사내 전용"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-black">섹션</h2>
            <SkillSectionsEditor sections={sections} onChange={setSections} issues={issues} />
          </div>
        </div>

        {/* 미리보기 */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <p className="mb-6 text-xs uppercase tracking-wide text-gray-400">미리보기</p>
            <h1 className="mb-8 text-3xl font-normal leading-tight text-black">{title}</h1>
            {sections.length > 0 ? (
              <SkillSectionRenderer sections={sections} />
            ) : (
              <p className="text-gray-400">섹션이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
