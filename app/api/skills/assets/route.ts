/**
 * 스킬 이미지 업로드
 *
 * POST /api/skills/assets   multipart/form-data — field: file, (선택) slug
 *
 * 두 종류의 호출자가 같은 경로를 쓴다:
 *   - 관리 화면(에디터)  → 관리자 세션 쿠키
 *   - 게시 스킬(에이전트) → Bearer 토큰
 * 둘 중 하나만 맞으면 통과시킨다.
 */
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"
import { getWriteClient } from "@/lib/supabase-server"

const BUCKET = "thumbnails"
const MAX_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "video/mp4"]

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function isAuthorized(request: Request): Promise<boolean> {
  const store = await cookies()
  if (verifySessionToken(store.get(ADMIN_COOKIE)?.value)) return true

  const expected = process.env.LIGHT_ARCHIVE_PUBLISH_TOKEN
  if (!expected) return false
  const header = request.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  return Boolean(token) && safeEqual(token, expected)
}

/**
 * 저장 키는 ASCII 만 쓴다.
 * Supabase Storage 는 키에 한글/유니코드를 InvalidKey 로 거부하고,
 * macOS 는 한글 파일명을 자모 분리형으로 넘겨서 정규식 치환이 전부 깨진다.
 * 원본 파일명은 어차피 화면에 안 쓰므로 확장자만 살린다.
 */
function buildKey(slug: string | null, fileName: string): string {
  const ext = (fileName.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "")
  const random = Math.random().toString(36).slice(2, 8)
  const folder = slug && /^[a-z][a-z0-9-]*$/.test(slug) ? slug : "shared"
  return `skill-images/${folder}/${Date.now()}-${random}.${ext}`
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json(
      { ok: false, error: "관리자 로그인 또는 Bearer 토큰이 필요합니다" },
      { status: 401 }
    )
  }

  try {
    const form = await request.formData()
    const file = form.get("file")
    const slug = form.get("slug")

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file 필드가 필요합니다" }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `파일이 너무 큽니다 (${Math.round(file.size / 1024 / 1024)}MB / 최대 10MB)` },
        { status: 400 }
      )
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: `지원하지 않는 형식입니다: ${file.type}` },
        { status: 400 }
      )
    }

    const key = buildKey(typeof slug === "string" ? slug : null, file.name)
    const supabase = getWriteClient()

    const { error } = await supabase.storage.from(BUCKET).upload(key, file, {
      cacheControl: "31536000",
      upsert: false,
      // 키에 확장자가 있어도 contentType 을 명시해야 다운로드가 octet-stream 이 되지 않는다
      contentType: file.type || "application/octet-stream",
    })
    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(key)

    return NextResponse.json({ ok: true, url: publicUrl, key, size: file.size, type: file.type })
  } catch (error) {
    console.error("[POST /api/skills/assets]", error)
    const message = error instanceof Error ? error.message : "알 수 없는 오류"
    return NextResponse.json({ ok: false, error: `업로드 실패: ${message}` }, { status: 500 })
  }
}
