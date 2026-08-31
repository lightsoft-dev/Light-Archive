/**
 * 관리자 아카이브 수정·삭제
 *
 * PATCH  /api/admin/archives/{id}
 * DELETE /api/admin/archives/{id}
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"
import { getWriteClient } from "@/lib/supabase-server"

interface Props {
  params: Promise<{ id: string }>
}

async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()
  if (!verifySessionToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: "관리자 로그인이 필요합니다" }, { status: 401 })
  }
  return null
}

export async function GET(_request: Request, { params }: Props) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  try {
    // 관리 화면은 draft 도 열어야 한다. 공개 조회 경로(status=published 제한)로는 안 되므로
    // 서버에서 읽어 내려준다.
    const { data, error } = await getWriteClient()
      .from("archive_items")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ ok: false, error: "찾을 수 없습니다" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, archive: data })
  } catch (error) {
    console.error(`[GET /api/admin/archives/${id}]`, error)
    return NextResponse.json({ ok: false, error: "조회 실패" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  try {
    const updates = await request.json()
    const { data, error } = await getWriteClient()
      .from("archive_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, archive: data })
  } catch (error) {
    console.error(`[PATCH /api/admin/archives/${id}]`, error)
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ ok: false, error: `수정 실패: ${message}` }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { id } = await params
  try {
    const { error } = await getWriteClient().from("archive_items").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(`[DELETE /api/admin/archives/${id}]`, error)
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ ok: false, error: `삭제 실패: ${message}` }, { status: 500 })
  }
}
