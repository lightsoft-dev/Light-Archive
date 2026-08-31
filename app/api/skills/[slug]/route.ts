/**
 * GET /api/skills/{slug} — 스킬 단건 조회
 *
 * 게시 스킬이 배포 직후 "실제로 올라갔는지"를 확인하는 용도.
 * draft 는 preview 토큰이 맞을 때만 돌려준다.
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSkillBySlug } from "@/lib/supabase-skills"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"

interface Props {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, { params }: Props) {
  const { slug } = await params
  const preview = new URL(request.url).searchParams.get("preview")
  const expected = process.env.SKILL_PREVIEW_TOKEN
  const includeDraft = Boolean(expected && preview && preview === expected)

  const cookieStore = await cookies()
  const isLoggedIn = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value)

  const skill = await getSkillBySlug(slug, { includeDraft, includeInternal: isLoggedIn })

  if (!skill) {
    return NextResponse.json({ ok: false, error: `'${slug}' 스킬을 찾을 수 없습니다` }, { status: 404 })
  }

  return NextResponse.json({ ok: true, skill })
}
