/**
 * 관리자 세션 (서버 전용)
 *
 * 기존에는 브라우저에서 `email === "admin" && password === "1234"`를 비교하고
 * sessionStorage 에 플래그를 넣었다. 그건 화면만 가리는 자물쇠라서, 데이터 쓰기를
 * 서버로 옮기려면 서버가 확인할 수 있는 세션이 먼저 필요하다.
 *
 * 방식은 stateless 서명 토큰이다 — DB 테이블 없이 만료시각에 HMAC 서명을 붙이고,
 * httpOnly 쿠키로 내려서 자바스크립트가 읽지 못하게 한다.
 */
import { createHmac, timingSafeEqual } from "node:crypto"

export const ADMIN_COOKIE = "la_admin"
const SESSION_HOURS = 12

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    // 비밀이 없으면 아무 토큰이나 통과시키는 것보다 로그인을 막는 게 낫다
    throw new Error("ADMIN_SESSION_SECRET 이 설정되지 않았습니다")
  }
  return secret
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex")
}

/** 비밀번호가 맞는지 확인. 길이 차이로도 정보가 새지 않게 상수 시간에 가깝게 비교한다 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  if (input.length !== expected.length) return false

  const a = Buffer.from(input)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** `만료시각.서명` 형태의 토큰 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000
  return `${expiresAt}.${sign(String(expiresAt))}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const [expiresAtRaw, signature] = token.split(".")
  if (!expiresAtRaw || !signature) return false

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  let expected: string
  try {
    expected = sign(expiresAtRaw)
  } catch {
    return false // 시크릿 미설정
  }

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
}
