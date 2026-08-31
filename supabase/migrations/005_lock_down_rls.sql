-- =====================================================
-- archive_items RLS 잠금  ✅ 적용 완료 2026-08-31
-- =====================================================
-- 적용 전 실측(프로덕션 anon key):
--   INSERT 201 · DELETE 204 · draft 조회 3건  → 익명 위조·삭제·초안열람이 모두 가능했다
-- 적용 후 실측:
--   INSERT 401 · UPDATE/DELETE 0행(데이터 무변) · draft 0건 · published 23건
--   관리자 27건 조회 OK · 서버 PATCH 200 · 조회수 4→5 증가
-- 현재 상태(001에서 만들어진 그대로): SELECT/INSERT/UPDATE/DELETE 가 전부
-- `{public}` 역할에 `true` 다. anon key 는 공개 사이트의 브라우저 번들에 들어 있으므로
-- 그 키를 읽은 누구나 아카이브를 위조·수정·삭제할 수 있다.
--
-- 선결 조건 (전부 완료)
--   1) SUPABASE_SERVICE_ROLE_KEY 를 Vercel·.env.local 에 설정 ✅
--      쓰기 정책을 전부 지우면 service_role 만이 유일한 쓰기 경로가 된다(RLS 우회).
--   2) 관리자 쓰기가 서버 API 경유 ✅ (배포 bb025f8)
--   3) 조회수 함수가 SECURITY DEFINER ✅ (004)
--      — 이걸 안 했으면 조회수 증가가 에러도 없이 조용히 실패했다.
--
-- ⚠️ 이 Supabase 프로젝트는 회사 ERP 테이블(quotations·expenses·receipts·projects…)과
--    공유된다. service_role 키는 그 테이블까지 권한을 준다. Light Archive 가 침해되면
--    ERP 까지 노출된다. 근본 해결은 Light Archive 를 별도 프로젝트로 분리하는 것이다
--    (docs/backlog.md 참조).
-- =====================================================

-- 1. 읽기 — 공개된 것만. draft 는 서버(service_role) 경유로만 보인다.
DROP POLICY IF EXISTS "archive_items_select_policy" ON archive_items;
CREATE POLICY "archive_items_public_read"
  ON archive_items FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 2. 쓰기 — 정책을 없앤다. RLS 가 켜져 있고 정책이 없으면 거부가 기본이다.
--    service_role 은 RLS 를 우회하므로 서버 API 만 쓸 수 있게 된다.
DROP POLICY IF EXISTS "archive_items_insert_policy" ON archive_items;
DROP POLICY IF EXISTS "archive_items_update_policy" ON archive_items;
DROP POLICY IF EXISTS "archive_items_delete_policy" ON archive_items;

-- 3. 검증 — 적용 직후 아래를 확인한다.
--    (a) 공개 목록이 보이는가          curl https://archive.lightsoft.dev/api/skills
--    (b) draft 가 anon 에게 안 보이는가 REST 로 status=eq.draft 조회 → 0건
--    (c) 관리자 로그인 후 목록이 나오는가 (draft 포함)
--    (d) 관리자 생성/수정/삭제가 되는가
--    (e) 상세 페이지 조회수가 오르는가
--
-- 되돌리기 — 001_create_archive_tables.sql 의 정책 4개를 다시 만들면 원상복구된다.
