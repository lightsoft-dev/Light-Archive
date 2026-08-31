-- =====================================================
-- archive_items RLS 잠금  ⚠️ 아직 적용하지 않음
-- =====================================================
-- 현재 상태(001에서 만들어진 그대로): SELECT/INSERT/UPDATE/DELETE 가 전부
-- `{public}` 역할에 `true` 다. anon key 는 공개 사이트의 브라우저 번들에 들어 있으므로
-- 그 키를 읽은 누구나 아카이브를 위조·수정·삭제할 수 있다.
--
-- ⚠️ 적용 전 반드시 필요한 것
--   1) SUPABASE_SERVICE_ROLE_KEY 가 배포 환경(Vercel)과 .env.local 에 설정돼 있어야 한다.
--      쓰기 정책을 전부 지우면 service_role 만이 유일한 쓰기 경로가 되기 때문이다.
--      (service_role 은 RLS 를 우회한다)
--   2) 관리자 쓰기가 서버 API 경유여야 한다 → 2026-08-31 완료
--      (/api/admin/archives, /api/admin/session)
--   3) 조회수 함수가 SECURITY DEFINER 여야 한다 → 004 에서 완료
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
