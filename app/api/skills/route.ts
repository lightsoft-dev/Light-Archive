/**
 * 스킬 카탈로그 게시 API
 *
 * POST /api/skills          — 게시(생성 또는 갱신). Bearer 토큰 필요.
 * POST /api/skills?dryRun=1 — 검증만. 저장하지 않는다.
 * GET  /api/skills  — 공개된 스킬 목록. 인증 불필요.
 *
 * 왜 MCP 가 아니라 REST 인가 — MCP 는 세션/transport 오버헤드가 있어 CI·셸 스크립트에서
 * 쓰기 어렵다. 게시 경로의 정본은 이 API 이고 MCP 도구는 이걸 호출한다.
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ZodError } from "zod"

import { formatZodIssues, skillPublishSchema } from "@/lib/skill-publish-schema"
import { getWriteClient } from "@/lib/supabase-server"
import { getSkillCatalog } from "@/lib/supabase-skills"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"
import { SKILL_CATEGORY } from "@/types/skill"

// ---------------------------------------------------------------------------
// 인프라
// ---------------------------------------------------------------------------

/** 타이밍 공격을 피하려고 길이와 내용을 상수 시간에 가깝게 비교한다 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.LIGHT_ARCHIVE_PUBLISH_TOKEN
  if (!expected) return false // 토큰 미설정이면 게시 자체를 막는다

  const header = request.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  if (!token) return false

  return safeEqual(token, expected)
}

function generateArchiveId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let random = ""
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${Date.now()}-${random}`
}

// ---------------------------------------------------------------------------
// GET — 공개 목록
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    // 사내 전용 스킬은 로그인한 사람에게만 내려준다.
    // 판정을 서버에서 하는 이유 — 브라우저가 직접 조회하면 그 필터를 우회할 수 있다.
    const cookieStore = await cookies()
    const isLoggedIn = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value)

    const skills = await getSkillCatalog(isLoggedIn)
    return NextResponse.json({ ok: true, count: skills.length, skills, viewerLoggedIn: isLoggedIn })
  } catch (error) {
    console.error("[GET /api/skills]", error)
    return NextResponse.json({ ok: false, error: "목록을 불러오지 못했습니다" }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — 게시 (slug 기준 upsert)
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "인증 실패. Authorization: Bearer <LIGHT_ARCHIVE_PUBLISH_TOKEN> 헤더가 필요합니다" },
      { status: 401 }
    )
  }

  let payload
  try {
    payload = skillPublishSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "페이로드 검증 실패", issues: formatZodIssues(error) },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: "JSON 파싱 실패" }, { status: 400 })
  }

  // dryRun=1 이면 검증만 하고 저장하지 않는다.
  // 게시 스킬이 스키마를 복사해 들고 있지 않아도 되게 하려는 것 —
  // 스키마 정본은 이 API 한 곳이고, 스킬은 여기에 물어봐서 확인한다.
  const dryRun = new URL(request.url).searchParams.get("dryRun")
  if (dryRun === "1" || dryRun === "true") {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      slug: payload.slug,
      sectionTypes: payload.sections.map((section) => section.type),
      message: "검증 통과. 저장하지 않았습니다.",
    })
  }

  try {
    const supabase = getWriteClient()

    // 같은 slug 가 이미 있으면 갱신한다 — 스킬을 여러 번 배포해도 글이 늘지 않게(멱등)
    const { data: existing, error: lookupError } = await supabase
      .from("archive_items")
      .select("id, status, published_at")
      .eq("slug", payload.slug)
      .maybeSingle()

    if (lookupError) throw lookupError

    const nowIso = new Date().toISOString()
    const row = {
      title: payload.title,
      description: payload.description,
      category: SKILL_CATEGORY,
      status: payload.status,
      slug: payload.slug,
      author: payload.author ?? null,
      tags: payload.tags ?? [],
      thumbnail_url: payload.thumbnailUrl ?? null,
      sections: payload.sections,
      skill_meta: {
        visibility: payload.visibility,
        ...(payload.source ?? {}),
      },
      // 처음 published 로 올라간 시점을 유지한다 (재게시로 날짜가 밀리지 않게)
      published_at:
        payload.status === "published"
          ? (existing?.published_at as string | null) ?? nowIso
          : (existing?.published_at as string | null) ?? null,
    }

    let action: "created" | "updated"
    let id: string

    if (existing) {
      id = existing.id as string
      const { error } = await supabase.from("archive_items").update(row).eq("id", id)
      if (error) throw error
      action = "updated"
    } else {
      id = generateArchiveId()
      const { error } = await supabase.from("archive_items").insert({ id, ...row })
      if (error) throw error
      action = "created"
    }

    const origin = new URL(request.url).origin
    const url = `${origin}/skills/${payload.slug}`
    const previewToken = process.env.SKILL_PREVIEW_TOKEN

    return NextResponse.json({
      ok: true,
      action,
      id,
      slug: payload.slug,
      status: payload.status,
      url,
      previewUrl:
        payload.status === "draft" && previewToken
          ? `${url}?preview=${encodeURIComponent(previewToken)}`
          : null,
    })
  } catch (error) {
    console.error("[POST /api/skills]", error)
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ ok: false, error: `게시 실패: ${message}` }, { status: 500 })
  }
}
