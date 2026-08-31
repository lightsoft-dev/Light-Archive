/**
 * 서버 전용 Supabase 클라이언트 (쓰기용)
 *
 * /api/skills 와 /api/admin/archives 두 곳에서 같은 클라이언트가 필요해서 분리했다.
 *
 * service_role 키가 있으면 그걸 쓴다. 지금은 RLS 가 열려 있어 anon 으로도 쓰기가 되지만,
 * RLS 를 조인 뒤에는 service_role 이 유일한 쓰기 경로가 된다.
 * 그때 env 만 추가하면 이 코드는 그대로 동작한다.
 *
 * 주의 — 이 Supabase 프로젝트는 회사 ERP 테이블과 공유된다. service_role 키는 그 테이블까지
 * 접근 권한을 주므로, 반드시 서버에서만 읽고 NEXT_PUBLIC_ 접두사를 붙이지 않는다.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export function getWriteClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Supabase 환경변수가 없습니다 (NEXT_PUBLIC_SUPABASE_URL / KEY)")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/** service_role 로 붙었는지 — RLS 를 조인 뒤 진단에 쓴다 */
export function hasServiceRole(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
}
