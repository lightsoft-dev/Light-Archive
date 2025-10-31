# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Light Archive는 AI 기반 기술/프로젝트 아카이브 플랫폼입니다. Next.js 16, React 19, Supabase를 사용하여 구축되었으며, Radix UI와 Tailwind CSS를 통해 미니멀한 디자인을 제공합니다.

**핵심 목적:**
- 외부: 팀의 기술력과 프로젝트 성과 홍보
- 내부: 지식 자산 축적 및 재활용

## Development Commands

### 필수 명령어
```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 실행
pnpm lint
```

### 패키지 관리
- **중요**: 이 프로젝트는 `pnpm`을 사용합니다. `npm`이나 `yarn` 대신 `pnpm`을 사용하세요.

```bash
# 패키지 설치
pnpm add <package-name>

# 개발 의존성 설치
pnpm add -D <package-name>
```

## Architecture Overview

### 디렉토리 구조

```
/app                    # Next.js App Router 페이지
  /admin                # 관리자 페이지 (로그인, 포스트 관리)
  /projects/[id]        # 동적 프로젝트 상세 페이지
  /test                 # Supabase 연결 테스트 페이지 (빌드에서 제외됨)
  /_test                # 비활성화된 테스트 페이지

/components             # React 컴포넌트
  /admin                # 관리자 전용 컴포넌트 (posts-table, login-dialog, rich-text-editor)
  /ui                   # Radix UI 기반 재사용 가능한 UI 컴포넌트
  /mock                 # Mock 데이터 (개발/테스트용)

/lib                    # 유틸리티 및 설정
  supabase.ts           # Supabase 클라이언트 설정
  utils.ts              # 일반 유틸리티 함수

/docs                   # 프로젝트 문서
  기획서v2.0.md         # 상세 기능 명세서
  supabase-guide.md     # Supabase 연결 및 설정 가이드
```

### 핵심 아키텍처 패턴

#### 1. Supabase 클라이언트 초기화 (`lib/supabase.ts`)

**빌드 타임 vs 런타임 처리:**
- 빌드 타임에는 더미 URL/Key를 사용하여 TypeScript 에러 방지
- 런타임에는 실제 환경 변수 사용
- `checkSupabaseConfig()` 함수로 런타임 환경 변수 검증 가능

```typescript
// 더미 값으로 초기화하여 빌드 시 에러 방지
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGci...'
)
```

**중요**: 실제 Supabase 기능을 사용하려면 `.env.local` 파일에 실제 값이 필요합니다.

#### 2. 페이지 구조 패턴

**메인 페이지 (`app/page.tsx`):**
- 3-컬럼 레이아웃: Sidebar (왼쪽) + Main Content (중앙) + Related Projects (오른쪽)
- 모바일: Sidebar는 오버레이로 표시되며, Related Projects는 하단으로 이동
- 상태 관리: `useState`로 사이드바 열림/닫힘 관리

**관리자 페이지 (`app/admin/page.tsx`):**
- 로그인 시스템: 단순 로컬 상태 기반 (현재 mock 데이터 사용)
  - 계정: `admin` / 비밀번호: `1234`
- TanStack Table 사용: 정렬, 필터링, 페이지네이션 기능 제공
- CRUD 기능: 포스트 수정/삭제 (현재 로컬 상태, 추후 Supabase 연동 예정)

#### 3. UI 컴포넌트 시스템

**Radix UI 기반:**
- 접근성(A11y) 준수
- 헤드리스 컴포넌트로 완전한 스타일 커스터마이징 가능
- `class-variance-authority` (cva)로 버튼, 카드 등의 variant 관리

**Tailwind CSS:**
- Tailwind v4 사용
- 디자인 원칙: 미니멀리즘 (검정/흰색 베이스)
- 8px 기준 그리드 시스템

#### 4. 상태 관리

**현재 상태:**
- 로컬 `useState` 기반
- Mock 데이터 사용 (`components/mock/posts.ts`)

**추후 계획 (기획서v2.0 참고):**
- Supabase Realtime으로 실시간 업데이트
- RLS(Row Level Security) 정책 기반 접근 제어
- JWT 또는 Supabase Auth 기반 세션 관리

## Supabase Integration

### 환경 변수 설정

`.env.local` 파일에 다음을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**주의:**
- `.env.local`은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- `NEXT_PUBLIC_` 접두사는 클라이언트에서 접근 가능하게 만듭니다
- 환경 변수 변경 시 반드시 개발 서버를 재시작하세요

### 데이터베이스 스키마

**주요 테이블 (`docs/기획서v2.0.md` 참고):**

1. **archives**: 메인 아카이브 테이블
   - 카테고리: 기술, 프로젝트, 리서치, 뉴스
   - 상태: draft, published, archived
   - 난이도, 분야, 작성자, 썸네일 등 메타데이터

2. **archive_labels**: 라벨/태그 (다대다 관계)

3. **archive_technologies**: 사용 기술 (다대다 관계)

4. **archive_revisions**: 수정 이력 (최대 50개 버전 보관)

5. **admin_users**: 관리자 계정 (bcrypt 해시)

### Storage 설정

**버킷 구조:**
- `thumbnails`: 아카이브 썸네일 이미지
- `test`: 테스트용 버킷 (개발 환경)

**RLS 정책:**
- Storage 버킷은 반드시 RLS 정책 설정 필요
- 테스트용 정책: 공개 읽기/쓰기/삭제
- 프로덕션: 인증된 사용자만 접근 가능하도록 제한

## Key Features & Implementation Notes

### 1. 유사 항목 추천 시스템

**추천 로직 (우선순위):**
1. 같은 카테고리 (가중치 30%)
2. 같은 라벨/분야 2개 이상 일치 (가중치 40%)
3. 같은 기술 1개 이상 일치 (가중치 20%)
4. 텍스트 유사도 (TF-IDF, 코사인 유사도, 가중치 10%)

**성능 최적화:**
- 추천 결과 캐싱 (24시간)
- 배치 처리 (하루 1회)
- 최대 10개 계산 후 상위 4개만 표시

### 2. AI 기능 (추후 구현 예정)

**OpenAI API 사용:**
- 초안 자동 생성 (카테고리별 템플릿)
- 요약 자동 생성 (80-120자)
- 태그 자동 제안 (최대 10개)

**API 제약사항:**
- 요청 제한: 분당 10회, 시간당 100회
- 에러 처리: 최대 3회 재시도
- 비용 관리: 토큰 사용량 추적

### 3. 검색 및 필터링

**PostgreSQL Full-Text Search:**
- 한국어 형태소 분석
- GIN 인덱스 최적화
- 검색 대상: 제목 (40%), 본문 (30%), 라벨 (20%), 기술명 (10%)

**필터 항목:**
- 카테고리, 라벨, 분야, 기술, 난이도, 작성 기간
- AND 조건 (모든 필터 만족)
- 저장된 필터 조합 (로컬 스토리지)

## Build Configuration

### Next.js Config (`next.config.mjs`)

```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,  // TypeScript 에러 무시 (개발 중)
  },
  images: {
    unoptimized: true,        // 이미지 최적화 비활성화
  },
}
```

**주의:**
- `ignoreBuildErrors`는 개발 중 임시 설정입니다. 프로덕션 배포 전에 제거하세요.
- `images.unoptimized`는 Vercel 배포 시 제거 가능 (Vercel Image Optimization 사용)

### TypeScript Config

- **Path Alias**: `@/*` → 프로젝트 루트
- **Strict Mode**: 활성화
- **Target**: ES6
- **JSX**: react-jsx

## Design System

### 컬러 시스템
- 주 색상: 검정 (#000000)
- 배경: 흰색 (#FFFFFF)
- 텍스트: 검정 (#000000), 회색 (#666666, #999999)
- 강조: 투명도 및 블러 효과 활용

### 타이포그래피
- 폰트: Inter (Google Fonts)
- 시스템 폰트 폴백
- 코드: 모노스페이스 폰트

### 반응형 브레이크포인트
- 모바일: 0px - 768px (1열 그리드)
- 태블릿: 768px - 1024px (2-3열 그리드)
- 데스크톱: 1024px 이상 (4열 그리드)

### 아이콘
- Lucide React 사용
- 크기: 16px, 20px, 24px

## Security Considerations

### 현재 보안 상태
- Mock 데이터 기반 인증 (admin/1234)
- 클라이언트 사이드 상태 관리

### 프로덕션 보안 (추후 구현)
- Supabase Auth 또는 JWT 기반 인증
- bcrypt 비밀번호 해싱
- RLS 정책 기반 데이터 접근 제어
- CSRF 토큰 검증
- XSS 방지 (입력값 검증 및 이스케이프)
- SQL Injection 방지 (파라미터화된 쿼리)
- 파일 업로드 검증 (타입, 크기 제한)

## Performance Optimization

### 프론트엔드
- 이미지: WebP 형식, lazy loading
- 코드 스플리팅: 페이지별 분리
- React 최적화: React.memo, useMemo 활용

### 백엔드
- 데이터베이스 인덱싱
- 쿼리 최적화 (N+1 문제 해결)
- 캐싱: Redis 또는 Supabase Edge Functions
- 페이지네이션: 커서 기반 또는 오프셋 기반

## Deployment

### 배포 환경
- **프론트엔드**: Vercel 또는 Netlify
- **데이터베이스**: Supabase PostgreSQL
- **파일 스토리지**: Supabase Storage
- **CDN**: Vercel Edge Network

### Vercel 배포 시 주의사항
- 환경 변수는 Vercel Dashboard에서 설정
- `NEXT_PUBLIC_*` 변수는 빌드 시점에 주입됨
- Vercel Analytics 활성화됨 (`@vercel/analytics`)

## Common Issues & Troubleshooting

### Supabase 연결 오류
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수명 확인 (`NEXT_PUBLIC_` 접두사 필수)
3. 개발 서버 재시작 (`pnpm dev`)
4. `docs/supabase-guide.md` 참고

### "Could not find the table" 오류
- 이 오류는 실제로 연결이 정상이지만 테이블이 없을 때 발생
- Supabase 대시보드에서 테이블 생성 필요
- SQL 스키마는 `docs/기획서v2.0.md` 참고

### Storage 업로드 실패 (RLS 오류)
- Storage 버킷의 RLS 정책이 설정되지 않았을 가능성
- Supabase Dashboard > Storage > Policies에서 정책 생성
- `docs/supabase-guide.md` 의 "Storage 버킷 생성 및 권한 설정" 참고

### TypeScript 빌드 에러
- 현재 `next.config.mjs`에서 `ignoreBuildErrors: true` 설정
- 프로덕션 배포 전에 모든 타입 에러 수정 필요

## Testing

### 테스트 페이지
- `/test`: Supabase 연결 테스트 페이지
  - 환경 변수 확인
  - 연결 테스트
  - 데이터베이스 테스트
  - Storage 테스트
- **주의**: 이 페이지는 빌드에서 제외됨 (`app/_test`로 이동됨)

### 개발 테스트 방법
1. `pnpm dev` 실행
2. `http://localhost:3000/test` 접속
3. 각 테스트 버튼 클릭하여 연결 확인

## Related Documentation

- **기획서**: `docs/기획서v2.0.md` - 전체 기능 명세 및 데이터베이스 스키마
- **Supabase 가이드**: `docs/supabase-guide.md` - Supabase 연결 및 설정 가이드
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Radix UI Docs**: https://www.radix-ui.com/docs/primitives/overview/introduction
- **TanStack Table**: https://tanstack.com/table/latest

## Git Workflow

### 현재 브랜치
- **main**: 메인 브랜치

### 최근 커밋
- test 페이지 빌드 제외 처리 (`app/_test`로 이동)
- Supabase 클라이언트 초기화 방식 개선 (더미 키 사용)
- Light Archive UI 개선 및 Supabase 설정

### 커밋 컨벤션
- `feat:` - 새 기능
- `fix:` - 버그 수정
- `docs:` - 문서 변경
- `style:` - 코드 포맷팅 (기능 변경 없음)
- `refactor:` - 리팩토링
- `test:` - 테스트 추가/수정
- `chore:` - 빌드 설정 등 기타 변경

## Future Improvements (Phase 2-3)

### Phase 2
- 댓글 시스템
- 좋아요/북마크 기능
- 사용자 프로필
- 다국어 지원 (영어)
- RSS 피드

### Phase 3
- 소셜 로그인 (Google, GitHub)
- 아카이브 공유 링크 (비밀번호 보호)
- PDF 내보내기
- 알림 시스템 (이메일)
