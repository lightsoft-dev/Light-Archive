-- archive_comments 테이블 생성
-- 토스 스타일 익명 댓글 시스템

CREATE TABLE archive_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  archive_id TEXT NOT NULL REFERENCES archive_items(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL,
  avatar_bg TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 아카이브별 댓글 조회 성능을 위한 인덱스
CREATE INDEX idx_archive_comments_archive_id ON archive_comments(archive_id);
CREATE INDEX idx_archive_comments_created_at ON archive_comments(created_at DESC);

-- RLS 활성화
ALTER TABLE archive_comments ENABLE ROW LEVEL SECURITY;

-- 누구나 댓글을 읽을 수 있음
CREATE POLICY "댓글 공개 읽기"
  ON archive_comments FOR SELECT
  USING (true);

-- 누구나 댓글을 작성할 수 있음 (익명)
CREATE POLICY "댓글 익명 작성"
  ON archive_comments FOR INSERT
  WITH CHECK (true);
