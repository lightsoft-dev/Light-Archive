import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { ArrowUpRight, Github, Lock } from "lucide-react"

import { CatalogShell } from "@/components/catalog-shell"
import { CommentSection } from "@/components/comment-section"
import { SkillSectionRenderer } from "@/components/skill-sections"
import { SkillViewCounter } from "@/components/skill-view-counter"
import { getSkillBySlug, isLegacyArchiveId } from "@/lib/supabase-skills"
import type { SkillSection } from "@/lib/skill-sections"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/**
 * draft 미리보기 허용 여부.
 * 토큰이 서버 env 와 일치할 때만 열어준다 — 쿼리스트링만으로는 열리지 않는다.
 */
function canPreview(token: string | string[] | undefined): boolean {
  const expected = process.env.SKILL_PREVIEW_TOKEN
  if (!expected || typeof token !== "string") return false
  return token === expected
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const skill = await getSkillBySlug(slug)

  if (!skill) {
    return { title: "스킬 | Light Archive" }
  }

  const title = `${skill.title} | Light Archive`
  const description = skill.description || "Lightsoft 팀의 에이전트 스킬"

  return {
    title,
    description,
    openGraph: { title, description, url: `/skills/${slug}`, type: "article" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/skills/${slug}` },
  }
}

export default async function SkillDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview } = await searchParams

  const skill = await getSkillBySlug(slug, canPreview(preview))

  if (!skill) {
    // 기존 /skills/{id}(기술 아카이브) 링크는 /tech/{id} 로 넘긴다.
    // slug 는 영문 케밥케이스, 옛 id 는 숫자/타임스탬프라 실제 존재 여부로 판정한다.
    if (await isLegacyArchiveId(slug)) {
      permanentRedirect(`/tech/${slug}`)
    }
    notFound()
  }

  const meta = skill.skill_meta
  const isInternal = meta?.visibility === "internal"
  const sections = (skill.sections || []) as SkillSection[]
  const isDraft = skill.status !== "published"
  // repoPath 가 있으면 저장소 루트가 아니라 스킬 폴더로 바로 보낸다
  const repoUrl = meta?.repo
    ? `https://github.com/${meta.repo}${meta.repoPath ? `/tree/main/${meta.repoPath}` : ""}`
    : null

  return (
    <CatalogShell>
      <SkillViewCounter archiveId={skill.id} />

      <article className="mx-auto max-w-4xl px-6 md:px-8 py-12 md:py-16">
        {isDraft && (
          <p className="mb-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            미리보기 — 아직 공개되지 않은 초안입니다.
          </p>
        )}

        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/skills" className="transition-colors hover:text-black">
            스킬
          </Link>
        </nav>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-gray-100 px-2.5 py-1 font-mono text-sm text-gray-700">
              {skill.slug}
            </code>
            {isInternal && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                <Lock className="h-3 w-3" />
                사내 전용
              </span>
            )}
          </div>

          <h1 className="mt-4 text-4xl font-normal leading-tight text-black md:text-5xl">
            {skill.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            {skill.author && <span>{skill.author}</span>}
            {skill.published_at && (
              <span>{new Date(skill.published_at).toLocaleDateString("ko-KR")}</span>
            )}
            {typeof skill.view_count === "number" && <span>조회 {skill.view_count}</span>}
          </div>

          {(meta?.repo || meta?.skillsShUrl) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {meta.repo && (
                <a
                  href={repoUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-shimmer inline-flex items-center gap-2.5 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <Github className="h-4 w-4" />
                  GitHub 저장소 보기
                </a>
              )}
              {meta.skillsShUrl && (
                <a
                  href={meta.skillsShUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 transition-colors hover:border-black hover:text-black"
                >
                  skills.sh
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </header>

        {sections.length > 0 ? (
          <SkillSectionRenderer sections={sections} />
        ) : (
          <p className="text-lg leading-relaxed text-gray-700">{skill.description}</p>
        )}

        {skill.tags && skill.tags.length > 0 && (
          <div className="mt-16 flex flex-wrap gap-2 border-t border-gray-100 pt-8">
            {skill.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-16">
          <CommentSection archiveId={skill.id} />
        </div>
      </article>
    </CatalogShell>
  )
}
