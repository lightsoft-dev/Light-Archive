/**
 * 사이트 기본 URL 정본
 *
 * 도메인이 코드 곳곳에 하드코딩돼 있으면 canonical·OG·sitemap·JSON-LD 가 서로 다른 곳을
 * 가리켜 검색엔진이 중복 문서로 취급한다. 실제로 light-archive.vercel.app 과
 * archive.lightsoft.dev 가 둘 다 200 으로 응답하고 있었다.
 *
 * 배포 환경에서 도메인이 바뀌면 NEXT_PUBLIC_SITE_URL 하나만 설정한다.
 * (NEXT_PUBLIC_ 접두사는 빌드 타임에 주입되므로 Vercel 환경변수에 넣어야 반영된다)
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://archive.lightsoft.dev"
).replace(/\/$/, "")

/** 도메인만 (표시용) — 예: archive.lightsoft.dev */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

export const SITE_NAME = "Light Archive"
