# Supabase 설정 가이드

Light Archive 프로젝트의 Supabase 데이터베이스 설정 방법입니다.

## 📋 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [마이그레이션 실행](#3-마이그레이션-실행)
4. [테이블 확인](#4-테이블-확인)
5. [Storage 설정](#5-storage-설정)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 대시보드 접속
1. [Supabase](https://supabase.com) 접속
2. 로그인 또는 회원가입
3. "New Project" 클릭

### 1.2 프로젝트 설정
- **Name**: Light Archive
- **Database Password**: 강력한 비밀번호 생성 (저장해두기!)
- **Region**: Northeast Asia (Seoul)
- **Pricing Plan**: Free (시작용) 또는 Pro

---

## 2. 환경 변수 설정

### 2.1 API 키 확인
Supabase 프로젝트 대시보드에서:
1. Settings → API 메뉴
2. **Project URL** 복사
3. **anon public** 키 복사

### 2.2 .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ **주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

---

## 3. 마이그레이션 실행

### 방법 1: Supabase SQL Editor (추천)

1. Supabase 대시보드 → **SQL Editor** 메뉴
2. "New query" 클릭

#### Step 1: 테이블 생성
`supabase/migrations/001_create_archive_tables.sql` 파일 내용 복사 → 붙여넣기 → Run

#### Step 2: 초기 데이터 삽입
`supabase/migrations/002_seed_initial_data.sql` 파일 내용 복사 → 붙여넣기 → Run

### 방법 2: Supabase CLI (선택)

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

---

## 4. 테이블 확인

### 4.1 Table Editor에서 확인
1. Supabase 대시보드 → **Table Editor**
2. `archive_items` 테이블 확인
3. 데이터 확인: 프로젝트 8개 + 스킬 11개 = 총 19개

### 4.2 테이블 구조

```sql
archive_items
├── id (TEXT, PRIMARY KEY)
├── title (TEXT, NOT NULL)
├── description (TEXT)
├── category (TEXT, NOT NULL) -- '기술', '프로젝트' 등
├── sub_category (TEXT)
├── status (TEXT, DEFAULT 'published')
├── date (TEXT)
├── tags (TEXT[])
├── technologies (TEXT[])
├── difficulty (TEXT)
├── field (TEXT)
├── author (TEXT)
├── image (TEXT)
├── thumbnail_url (TEXT)
├── view_count (INTEGER, DEFAULT 0)
├── comment_count (INTEGER, DEFAULT 0)
├── content (TEXT)
├── excerpt (TEXT)
├── created_at (TIMESTAMPTZ, DEFAULT NOW())
├── updated_at (TIMESTAMPTZ, DEFAULT NOW())
└── published_at (TIMESTAMPTZ)
```

---

## 5. Storage 설정

### 5.1 Storage Bucket 생성
1. Supabase 대시보드 → **Storage** 메뉴
2. "New bucket" 클릭
3. Bucket 정보:
   - **Name**: `thumbnails`
   - **Public bucket**: ✅ (체크)
   - Create bucket

### 5.2 Storage 정책 설정

SQL Editor에서 실행:

```sql
-- 누구나 읽기 가능
CREATE POLICY "thumbnails_select_policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "thumbnails_insert_policy"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );

-- 인증된 사용자만 삭제 가능
CREATE POLICY "thumbnails_delete_policy"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );
```

### 5.3 폴더 구조

```
thumbnails (bucket)
└── archive-images/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.png
    └── ...
```

---

## 6. 테스트

### 6.1 개발 서버 실행

```bash
pnpm dev
```

### 6.2 페이지 확인
- 홈: http://localhost:3000
- 프로젝트 목록: http://localhost:3000/projects
- 스킬 목록: http://localhost:3000/skills
- 어드민: http://localhost:3000/admin (로그인: admin / 1234)

---

## 7. 문제 해결

### 연결 오류
```
Error: supabase client not initialized
```
→ `.env.local` 파일 확인 및 서버 재시작

### 데이터가 안 보임
```
Error: relation "archive_items" does not exist
```
→ 마이그레이션이 제대로 실행되지 않음. SQL Editor에서 수동 실행

### RLS 정책 오류
```
Error: new row violates row-level security policy
```
→ RLS 정책 확인. 필요시 임시로 RLS 비활성화:
```sql
ALTER TABLE archive_items DISABLE ROW LEVEL SECURITY;
```

---

## 8. 프로덕션 배포

### 8.1 환경 변수 설정
Vercel 또는 배포 플랫폼에서:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 8.2 빌드 테스트
```bash
pnpm build
```

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase + Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] 테이블 마이그레이션 실행
- [ ] 초기 데이터 삽입 확인
- [ ] Storage bucket 생성
- [ ] Storage 정책 설정
- [ ] 개발 서버에서 테스트
- [ ] 프로덕션 배포

---

## 🎉 완료!

이제 Supabase와 연동된 Light Archive를 사용할 수 있습니다!
