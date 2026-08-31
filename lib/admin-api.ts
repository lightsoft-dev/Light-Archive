/**
 * 관리자 화면이 쓰는 API 클라이언트 (브라우저 전용)
 *
 * 브라우저가 Supabase 를 직접 호출하던 것을 서버 API 경유로 바꾼 것이다.
 * 인증은 httpOnly 쿠키라 자바스크립트가 토큰을 들고 있지 않는다 —
 * `credentials: "same-origin"` 이면 브라우저가 알아서 붙인다.
 */
import type { Archive } from "@/types/archive"

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error || `요청 실패 (${res.status})`)
  }
  return body as T
}

// ── 세션 ──────────────────────────────────────────────────────────────────

export async function checkSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", { credentials: "same-origin" })
    const body = await res.json()
    return Boolean(body?.authenticated)
  } catch {
    return false
  }
}

export async function login(password: string): Promise<void> {
  await request("/api/admin/session", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

export async function logout(): Promise<void> {
  await request("/api/admin/session", { method: "DELETE" })
}

// ── 아카이브 ──────────────────────────────────────────────────────────────

export async function fetchAdminArchives(): Promise<Archive[]> {
  const body = await request<{ archives: Archive[] }>("/api/admin/archives")
  return body.archives
}

export async function fetchAdminArchive(id: string): Promise<Archive> {
  const body = await request<{ archive: Archive }>(`/api/admin/archives/${id}`)
  return body.archive
}

export async function createAdminArchive(archive: Record<string, unknown>): Promise<Archive> {
  const body = await request<{ archive: Archive }>("/api/admin/archives", {
    method: "POST",
    body: JSON.stringify(archive),
  })
  return body.archive
}

export async function updateAdminArchive(
  id: string,
  updates: Record<string, unknown>
): Promise<Archive> {
  const body = await request<{ archive: Archive }>(`/api/admin/archives/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
  return body.archive
}

export async function deleteAdminArchive(id: string): Promise<void> {
  await request(`/api/admin/archives/${id}`, { method: "DELETE" })
}
