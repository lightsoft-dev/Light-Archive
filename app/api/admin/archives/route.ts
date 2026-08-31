/**
 * 관리자 아카이브 목록·생성
 *
 * GET  /api/admin/archives   draft 포함 전체 (관리자 세션 필요)
 * POST /api/admin/archives   생성
 *
 * 브라우저가 Supabase 를 직접 호출하던 것을 서버로 옮긴 것이다.
 * 그래야 RLS 에서 anon 쓰기를 막아도 관리 화면이 계속 동작한다.
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"
import { getWriteClient } from "@/lib/supabase-server"

async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  if (!verifySessionToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다" }, { status: 401 })
  }
  return null
}

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { data, error } = await getWriteClient()
      .from("archive_items")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ ok: true, archives: data ?? [] })
  } catch (error) {
    console.error("[GET /api/admin/archives]", error)
    return NextResponse.json({ ok: false, error: "목록 조회 실패" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await request.json()
    if (!body?.id || !body?.title || !body?.category) {
      return NextResponse.json(
        { ok: false, error: "id, title, category 는 필수입니다" },
        { status: 400 }
      )
    }

    const { data, error } = await getWriteClient()
      .from("archive_items")
      .insert(body)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, archive: data })
  } catch (error) {
    console.error("[POST /api/admin/archives]", error)
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ ok: false, error: `생성 실패: ${message}` }, { status: 500 })
  }
}
