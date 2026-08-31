/**
 * 관리자 세션
 *
 * POST   /api/admin/session  로그인 — 비밀번호를 서버에서 검증하고 httpOnly 쿠키 발급
 * GET    /api/admin/session  현재 로그인 상태
 * DELETE /api/admin/session  로그아웃
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  ADMIN_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
  verifySessionToken,
} from "@/lib/admin-session"

export async function GET() {
  const store = await cookies()
  const authenticated = verifySessionToken(store.get(ADMIN_COOKIE)?.value)
  return NextResponse.json({ authenticated })
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { ok: false, error: "서버에 ADMIN_PASSWORD / ADMIN_SESSION_SECRET 이 설정되지 않았습니다" },
      { status: 500 }
    )
  }

  let password = ""
  try {
    const body = await request.json()
    password = typeof body?.password === "string" ? body.password : ""
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청" }, { status: 400 })
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다" }, { status: 401 })
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  return NextResponse.json({ ok: true })
}
