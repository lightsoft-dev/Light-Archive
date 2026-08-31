-- =====================================================
-- 조회수 증가 함수를 SECURITY DEFINER 로 (적용 완료 2026-08-31)
-- =====================================================
-- 왜 — 이 함수는 SECURITY INVOKER 라서 호출자(anon)의 권한으로 UPDATE 한다.
-- 지금은 anon UPDATE 정책이 열려 있어 동작하지만, 005 로 익명 쓰기를 막는 순간
-- 조회수 증가가 에러도 없이 조용히 실패한다
-- (PostgREST 는 RLS 로 걸린 UPDATE 를 실패가 아니라 0 rows 로 돌려준다).
--
-- DEFINER 는 함수 소유자 권한으로 실행되어 RLS 를 우회한다.
-- 하는 일이 view_count +1 뿐이라 권한이 새어도 피해가 없다.
-- search_path 고정은 DEFINER 함수의 기본 안전조치다.
-- =====================================================

CREATE OR REPLACE FUNCTION increment_archive_view_count(archive_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE archive_items
  SET view_count = view_count + 1
  WHERE id = archive_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_archive_view_count(TEXT) TO anon, authenticated;
