-- =====================================================
-- Archive 시스템 테이블 생성
-- =====================================================
-- 설명: Projects, Skills, Posts를 통합 관리하는 테이블
-- 접두사: archive_ (다른 테이블과 구분)
-- =====================================================

-- 1. 아카이브 아이템 테이블 (통합)
CREATE TABLE IF NOT EXISTS archive_items (
  -- 기본 필드
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,

  -- 카테고리
  category TEXT NOT NULL CHECK (category IN ('기술', '프로젝트', 'AI', 'Technology', 'Research', 'News')),
  sub_category TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),

  -- 메타데이터
  date TEXT,
  tags TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  difficulty TEXT,
  field TEXT,
  author TEXT,

  -- 미디어
  image TEXT,
  thumbnail_url TEXT,

  -- 통계
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- 콘텐츠
  content TEXT, -- Rich HTML content
  excerpt TEXT, -- 요약문

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2. 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_archive_items_category ON archive_items(category);
CREATE INDEX IF NOT EXISTS idx_archive_items_sub_category ON archive_items(sub_category);
CREATE INDEX IF NOT EXISTS idx_archive_items_status ON archive_items(status);
CREATE INDEX IF NOT EXISTS idx_archive_items_created_at ON archive_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_archive_items_tags ON archive_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_archive_items_technologies ON archive_items USING GIN(technologies);

-- 전체 텍스트 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_archive_items_search ON archive_items USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);

-- 3. 자동 updated_at 업데이트 트리거
CREATE OR REPLACE FUNCTION update_archive_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_archive_items_updated_at
  BEFORE UPDATE ON archive_items
  FOR EACH ROW
  EXECUTE FUNCTION update_archive_items_updated_at();

-- 4. 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_archive_view_count(archive_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE archive_items
  SET view_count = view_count + 1
  WHERE id = archive_id;
END;
$$ LANGUAGE plpgsql;

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 생성
-- 누구나 읽기 가능
CREATE POLICY "archive_items_select_policy"
  ON archive_items FOR SELECT
  USING (true);

-- 누구나 생성 가능
CREATE POLICY "archive_items_insert_policy"
  ON archive_items FOR INSERT
  WITH CHECK (true);

-- 누구나 수정 가능
CREATE POLICY "archive_items_update_policy"
  ON archive_items FOR UPDATE
  USING (true);

-- 누구나 삭제 가능
CREATE POLICY "archive_items_delete_policy"
  ON archive_items FOR DELETE
  USING (true);

-- 7. 코멘트 추가 (문서화)
COMMENT ON TABLE archive_items IS '프로젝트, 기술, 포스트를 통합 관리하는 아카이브 테이블';
COMMENT ON COLUMN archive_items.id IS '고유 식별자';
COMMENT ON COLUMN archive_items.title IS '아카이브 제목';
COMMENT ON COLUMN archive_items.category IS '카테고리: 기술, 프로젝트 등';
COMMENT ON COLUMN archive_items.tags IS '태그 배열';
COMMENT ON COLUMN archive_items.technologies IS '사용 기술 배열';
COMMENT ON COLUMN archive_items.view_count IS '조회수';
COMMENT ON COLUMN archive_items.content IS 'HTML 형식의 본문 내용';
