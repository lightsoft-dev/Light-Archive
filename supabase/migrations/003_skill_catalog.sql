-- =====================================================
-- 에이전트 스킬 카탈로그 (/skills)
-- =====================================================
-- 설명: archive_items 를 확장해서 스킬 카탈로그를 담는다.
--       신규 테이블을 만들지 않는 이유 — 댓글(archive_comments.archive_id),
--       조회수 함수, 검색 인덱스, OG 이미지, 관련항목 로직이 이미 이 테이블에
--       묶여 있어서 분리하면 그걸 전부 다시 구현해야 한다.
-- 대상 프로젝트: tjucmfulpsbarmmxfeao
-- =====================================================

-- 1. slug — /skills/{slug} 라우팅 키이자 게시 API 의 upsert 키
--    기존 아카이브(id 가 '1' 또는 타임스탬프형)와 달리 스킬은 영문 케밥케이스 slug 로 접근한다.
ALTER TABLE archive_items ADD COLUMN IF NOT EXISTS slug TEXT;

-- NULL 은 여러 개 허용하고 값이 있을 때만 유니크 (기존 행은 전부 NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_archive_items_slug
  ON archive_items(slug) WHERE slug IS NOT NULL;

-- 2. sections — 섹션 템플릿 본문. 에이전트가 채우는 구조화 JSON.
--    이게 있으면 섹션 렌더러가, 없으면 기존 content HTML 렌더러가 동작한다(하위호환).
ALTER TABLE archive_items ADD COLUMN IF NOT EXISTS sections JSONB;

-- 3. skill_meta — 설치 명령·저장소·공개범위 등 스킬 고유 메타데이터
--    { visibility, repo, install, skillsShUrl, internalPath, harnesses[] }
--    컬럼 증식을 막으려고 JSONB 하나로 묶었다.
ALTER TABLE archive_items ADD COLUMN IF NOT EXISTS skill_meta JSONB;

-- 4. category CHECK 제약에 '스킬' 추가
--    이 단계를 빼면 스킬 INSERT 가 전부 제약 위반으로 실패한다.
ALTER TABLE archive_items DROP CONSTRAINT IF EXISTS archive_items_category_check;
ALTER TABLE archive_items ADD CONSTRAINT archive_items_category_check
  CHECK (category IN ('기술', '프로젝트', '스킬', 'AI', 'Technology', 'Research', 'News'));

-- 5. 카탈로그 목록 조회 인덱스 (category='스킬' 부분 인덱스)
CREATE INDEX IF NOT EXISTS idx_archive_items_skill_list
  ON archive_items(status, created_at DESC)
  WHERE category = '스킬';

-- 6. 문서화
COMMENT ON COLUMN archive_items.slug IS '스킬 카탈로그 URL 식별자. /skills/{slug}. 게시 API upsert 키';
COMMENT ON COLUMN archive_items.sections IS '섹션 템플릿 본문(JSON 배열). NULL 이면 content(HTML) 로 렌더';
COMMENT ON COLUMN archive_items.skill_meta IS '스킬 메타데이터: visibility/repo/install/skillsShUrl/internalPath/harnesses';
