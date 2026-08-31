-- =====================================================
-- 사내 전용 스킬을 anon 에게서 숨긴다  ✅ 적용 완료 2026-08-31
-- =====================================================
-- 앱(서버 API)은 이미 관리자 세션을 보고 걸러내지만, anon key 로 PostgREST 를 직접 치면
-- 그 판정을 우회한다. anon key 는 공개 사이트 번들에 들어 있으므로 앱 레벨 필터만으로는
-- 부족하다.
--
-- 적용 전 실측: category='스킬' 직접 조회에 internal 2건이 그대로 나왔다.
-- 적용 후 실측: 0건. published 전체는 21건(스킬 2건 제외)으로 기존 아카이브는 영향 없음.
--              로그인 사용자는 서버(service_role) 경유로 2건 정상 열람.
--
-- skill_meta 가 없는 기존 아카이브(기술·프로젝트)는 coalesce 로 'public' 취급된다.
-- =====================================================

DROP POLICY IF EXISTS "archive_items_public_read" ON archive_items;
CREATE POLICY "archive_items_public_read"
  ON archive_items FOR SELECT
  TO anon, authenticated
  USING (
    status = 'published'
    AND coalesce(skill_meta->>'visibility', 'public') <> 'internal'
  );
