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
  /tech                 # 기술 아카이브 목록/상세 (구 /skills, category='기술')
  /skills               # 에이전트 스킬 카탈로그 (category='스킬')
  /api/skills           # 스킬 게시 API (POST 인증 필요)
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

## 환경변수 받기 — 1Password (2026-09-01)

새로 합류하면 값을 물어보지 말고 아래 두 줄로 받는다. `.env.op` 는 저장소에 커밋돼 있고
실제 값이 아니라 1Password 참조만 담는다.

```bash
op signin
op inject -i .env.op -o .env.local
```

접근이 안 되면 `Shared` 볼트 공유를 요청한다(1Password CLI 는 `brew install 1password-cli`).

| 값 | 1Password 항목 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `OPENAI_API_KEY`, `LIGHT_ARCHIVE_PUBLISH_TOKEN`, `SKILL_PREVIEW_TOKEN`, `ADMIN_SESSION_SECRET` | **Light Archive - 개발 환경변수** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 라이트소프트 ERP - Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 라이트소프트 ERP - Supabase service_role key |
| 운영 `ADMIN_PASSWORD` | **Light Archive - 관리자 계정** (로컬은 아무 값이나) |

Supabase 키를 ERP 항목에서 참조하는 이유 — **같은 Supabase 프로젝트를 공유**하기 때문이다.
같은 값을 두 곳에 두면 로테이션 때 한쪽만 바뀌어 갈린다.

### 스킬로 아카이브에 게시할 때

값을 셸에 붙여넣지 말고 1Password 참조를 그대로 넘긴다 — `light-archive-publish` 가
`op read` 로 읽는다.

```bash
export SKILL_ARCHIVE_HOST=https://archive.lightsoft.dev
export SKILL_ARCHIVE_TOKEN="op://Shared/wsilportxuzzckcjahj5nsldrm/LIGHT_ARCHIVE_PUBLISH_TOKEN"
node ~/skills/macbook-cc/light-archive-publish/scripts/preflight.mjs
```

### `.env.op` 를 고칠 때 걸리는 것 (실측)

- **참조는 항목 ID로 쓴다.** 제목에 공백이 있으면 `op` 가 거기서 끊어 읽고
  `too few '/'` 로 실패한다. ID 는 제목이 바뀌어도 안 깨진다.
- **주석에도 참조 문법을 쓰지 않는다.** `op inject` 는 주석 줄까지 해석해서,
  설명으로 적어둔 예시를 치환하려다 실패한다. (이것 때문에 두 번 막혔다)
- `.gitignore` 의 `.env*` 에 걸리므로 `!.env.op` 예외가 있어야 커밋된다.

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

### 첨부파일 관리 (`lib/supabase-attachments.ts`)

아카이브 첨부파일은 **별도 DB 테이블/컬럼 없이 Storage 폴더 구조로만 관리**한다.
- 경로: `thumbnails/attachments/{archiveId}/{저장키}`
- 표시용 파일 목록은 DB가 아니라 Storage `list()` 결과에서 온다 (`getAttachments()`).
- 따라서 **Storage에 물리적으로 저장된 키가 곧 화면에 보이는 파일명**이다.

**한글 파일명 처리 (중요):**
- Supabase Storage는 한글/유니코드 키를 `InvalidKey`로 거부하고, macOS는 한글 파일명을 NFD(자모 분리형)로 전달한다.
- 그래서 원본 파일명을 **Base64URL로 인코딩**해 키에 보존한다. 저장 키 형식: `{timestamp}-enc-{base64url(NFC 원본명)}`.
- 조회 시 `enc-` 마커를 디코딩해 원본 한글명으로 복원한다 (마커 없는 구 파일은 타임스탬프만 제거하는 fallback — 단, 구 파일의 깨진 한글은 복구 불가).
- 키에 확장자가 안 남으므로 업로드 시 `contentType`을 명시한다.
- 상세 함정/실측 근거는 전역 룰 `~/.claude/rules/korean-filename-storage-key.md` 참고.

## 에이전트 스킬 카탈로그 (/skills)

`publish-agent-skill`로 배포한 스킬(또는 사내 전용 스킬)의 소개 페이지를 **에이전트가 API로 게시**한다.
기획 정본은 `docs/skill-catalog-plan.md`, 공개/사내 판정과 전체 경로는 `docs/skill-publishing.md`.

**사내 스킬은 private 저장소로 낸다.** `npx skills add` 는 접근 권한이 있으면 private 에서도
동작하므로(실측), 사내 스킬을 public 으로 낼 이유가 없다. 아카이브에서는
`visibility: "internal"` 로 게시해 로그인한 사람에게만 보이게 한다.

### 라우트

| 경로 | 내용 |
|---|---|
| `/tech`, `/tech/[id]` | 기존 기술 아카이브 (`category='기술'`). **구 `/skills`에서 이동** |
| `/skills` | 스킬 카탈로그 목록 (`category='스킬'`) |
| `/skills/[slug]` | 스킬 상세. slug가 없으면 옛 아카이브 id인지 보고 `/tech/{id}`로 301 |

### 데이터 모델

신규 테이블 없이 `archive_items`를 확장했다 — 댓글·조회수·검색·OG가 이미 이 테이블에 묶여 있어서다.

| 컬럼 | 용도 |
|---|---|
| `slug` | `/skills/{slug}` 라우팅 키이자 게시 API의 **upsert 키**. 영문으로 시작(옛 id와 구분) |
| `sections` (JSONB) | 섹션 템플릿 본문. 있으면 섹션 렌더, 없으면 기존 `content` HTML 렌더 |
| `skill_meta` (JSONB) | `{ visibility, repo, install, skillsShUrl, internalPath, harnesses }` |

마이그레이션: `supabase/migrations/003_skill_catalog.sql`

### 모듈 인덱스

| 파일 | 역할 |
|---|---|
| `lib/skill-sections.ts` | **섹션 스키마 정본**(zod). 12종 타입 + 필수/카탈로그/프리셋. 서버 검증과 프론트 타입이 여기서 같이 나온다 |
| `lib/skill-publish-schema.ts` | `POST /api/skills` 요청 스키마 + zod 에러 포매터 |
| `lib/supabase-skills.ts` | 카탈로그 조회 (`getSkillCatalog`, `getSkillBySlug`, `isLegacyArchiveId`) |
| `components/skill-sections.tsx` | 섹션 12종 렌더러 + 디스패처. 알 수 없는 type은 건너뛴다 |
| `components/skill-card.tsx` | 목록 카드 (설치 명령 복사 포함) |
| `components/catalog-shell.tsx` | Sidebar+TopNav 껍데기. 상세를 서버 컴포넌트로 유지하려고 분리 |

### 섹션 템플릿

필수 2개(`hero`, `install`) + 선택 10개(`problem` `before_after` `triggers` `steps` `demo`
`scope` `metrics` `faq` `code` `related`). 에이전트가 스킬 성격에 맞게 골라 조합한다.
성격별 권장 조합은 `SECTION_PRESETS`(`lib/skill-sections.ts`)에 있다.

### skills.sh 설치수 (2026-08-31)

공개 스킬이 실제로 얼마나 쓰이는지를 카탈로그로 끌어와 "설치 많은 순" 정렬을 제공한다.

- `lib/skills-sh.ts` — 조회. 공개 API 가 문서화돼 있지 않아 **검색 엔드포인트**를 쓴다(실측):
  `GET https://www.skills.sh/api/search?q=<name>` → `{ skills: [{ name, source, installs }] }`.
  `source` 가 `owner/repo` 라서 그것으로 우리 스킬을 골라낸다.
- **실패하면 조용히 `null`** — 외부 비공식 경로다. 설치수 때문에 목록이 안 뜨면 본말전도다.
  타임아웃 5초.
- **캐시는 프로세스 메모리 TTL(1시간)이다.** 처음엔 fetch 의 `next: { revalidate }` 를 썼는데
  실측하니 안 먹었다 — 이 API 는 `cookies()` 로 세션을 보기 때문에 동적 렌더링이고
  그 컨텍스트의 fetch 는 데이터 캐시를 타지 않는다(요청 5회 → 외부 호출 10회).
  인메모리로 바꾼 뒤 5회 → 2회(스킬 수만큼 1번). 실패도 캐시한다 —
  아직 색인 안 된 스킬을 매번 다시 물어볼 이유가 없다.
- 사내 전용은 skills.sh 에 없으므로 조회하지 않는다.
- 정렬에서 **설치수를 모르는 스킬은 뒤로** 보낸다(`?? -1`). 0 으로 취급하면
  "설치 0회"와 "모름"이 섞여 순위가 거짓말이 된다.

공개 직후에는 색인이 안 돼 있어 `null` 이 정상이다 — 시간이 지나면 채워진다.

### 사내 전용 스킬 (2026-08-31)

`skill_meta.visibility = "internal"` 은 **라벨이 아니라 실제 접근 제어**다. 두 겹으로 막는다.

| 층 | 무엇을 막나 |
|---|---|
| RLS (`006`) | anon key 로 PostgREST 를 직접 쳐도 internal 행이 안 보인다 |
| 서버 API | 목록·상세·단건·OG 모두 관리자 세션 쿠키를 보고 포함 여부를 정한다 |

- 자격이 없으면 **404**(403 아님) — 403 은 그 이름의 스킬이 존재한다는 사실을 흘린다.
- `getSkillCatalog`/`getSkillBySlug` 의 `includeInternal` 기본값은 `false`.
  빠뜨렸을 때 더 보이는 쪽이 아니라 덜 보이는 쪽으로 실패해야 한다.
- **OG 이미지도 막혀 있다** — 링크를 슬랙에 붙이는 것만으로 제목·설명이 새면 안 된다.
  익명에게는 기본 카드("Light Archive")만 나간다.
- `lib/supabase-skills.ts` 는 **서버 전용**이다. 클라이언트에서 import 하면 anon 으로 붙어
  사내 스킬이 없는 것처럼 보인다. 목록 화면도 `/api/skills` 를 거친다.

### 이미지

| 어디 | 무엇 |
|---|---|
| 목록 카드 | `thumbnail_url` — 있으면 16:9 썸네일, 없으면 텍스트 카드 |
| 본문 | `demo` 섹션의 `media[].url` |
| 공유 | `/skills/{slug}/opengraph-image` — 공개 스킬이면 설치 명령까지 카드에 넣는다 |

업로드는 `POST /api/skills/assets` 하나로 모았다(관리자 쿠키 **또는** Bearer 토큰).
저장 키는 서버가 ASCII 로 만든다 — 한글 파일명을 키에 쓰면 Storage 가 `InvalidKey` 로
거부하고 macOS 는 한글을 자모 분리형으로 넘겨서 파일명이 통째로 깨진다.
(전역 룰 `korean-filename-storage-key.md`)

- 관리 화면: 대표 이미지는 드래그&드롭, 섹션용은 "이미지 업로드 → URL 복사"
- 에이전트: `light-archive-publish/scripts/upload-image.mjs --file <경로> --slug <slug>`

### 관리 화면에서 섹션 편집

`/admin/skills/{slug}` — 왼쪽 편집 / 오른쪽 실시간 미리보기.

에이전트가 채운 것을 사람이 **다듬는** 게 주 시나리오라, 타입별 전용 폼 대신
**구조 조작은 버튼, 내용은 JSON** 으로 나눴다(12종 × 필드 수만큼 UI 를 만들고 스키마가
바뀔 때마다 따라가는 비용을 피한다).

- `components/admin/skill-sections-editor.tsx` — 섹션 카드(↑↓ 순서, 삭제, + 추가)
- 추가 목록에서 이미 쓴 singleton 섹션은 비활성 (서버 스키마와 같은 규칙)
- 검증은 두 겹 — 브라우저가 JSON 파싱 오류를 즉시 잡고,
  `PATCH /api/admin/archives/{id}` 가 스키마를 본다. 실패하면 400 + `issues[].path` 로
  어느 섹션의 어느 필드인지 카드에 표시된다
- 관리자 목록에서 `category === "스킬"` 인 행은 이 편집기로 간다

### 게시 API

```bash
curl -X POST https://archive.lightsoft.dev/api/skills \
  -H "Authorization: Bearer $LIGHT_ARCHIVE_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "slug": "...", "title": "...", "description": "...",
        "visibility": "public", "status": "draft",
        "source": { "install": "npx skills add owner/repo" },
        "sections": [ { "type": "hero", "data": { "tagline": "..." } } ] }'
```

- **멱등** — 같은 slug면 새 글이 안 생기고 갱신된다(`action: "updated"`).
- 기본 `status`는 `draft`. 응답의 `previewUrl`로 확인한 뒤 `published`로 다시 호출한다.
- 검증 실패 시 400과 함께 `issues: [{path, message}]`로 어디가 틀렸는지 돌려준다.

### 환경변수

| 이름 | 용도 |
|---|---|
| `LIGHT_ARCHIVE_PUBLISH_TOKEN` | 게시 API Bearer 토큰. **없으면 POST가 전부 401** |
| `SKILL_PREVIEW_TOKEN` | draft 미리보기 URL 토큰 |
| `SUPABASE_SERVICE_ROLE_KEY` | (선택) 있으면 API 쓰기에 사용. RLS를 조인 뒤에는 필수 — `docs/backlog.md` 참조. **`NEXT_PUBLIC_` 금지** |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호. 없으면 로그인 자체가 불가 |
| `ADMIN_SESSION_SECRET` | 세션 쿠키 서명 키 |
| `NEXT_PUBLIC_SITE_URL` | (선택) 사이트 정본 URL. 기본 `https://archive.lightsoft.dev` (`lib/site.ts`) |

## 관리자 인증과 쓰기 경로 (2026-08-31 변경)

브라우저가 Supabase 를 직접 쓰던 것을 **전부 서버 API 경유로 옮겼다.**
RLS 에서 익명 쓰기를 막아도 관리 화면이 계속 동작하게 하기 위한 선결 작업이다.

### 인증

| | 이전 | 지금 |
|---|---|---|
| 검증 위치 | 브라우저 (`email==="admin" && password==="1234"`) | 서버 (`POST /api/admin/session`) |
| 세션 | `sessionStorage` 플래그 (조작 가능) | httpOnly 서명 쿠키 `la_admin` (HMAC-SHA256, 12시간) |

- `lib/admin-session.ts` — 토큰 발급·검증. `ADMIN_PASSWORD`·`ADMIN_SESSION_SECRET` 필요
- `lib/admin-api.ts` — 관리 화면이 쓰는 브라우저 클라이언트. 쿠키는 `credentials: "same-origin"`으로 자동 전송

### 쓰기 API

```
POST   /api/admin/session       로그인      GET 상태 확인   DELETE 로그아웃
GET    /api/admin/archives      목록 (draft 포함)
POST   /api/admin/archives      생성
GET    /api/admin/archives/{id} 단건 (draft 포함)
PATCH  /api/admin/archives/{id} 수정
DELETE /api/admin/archives/{id} 삭제
```

전부 `la_admin` 쿠키를 검사한다. `lib/supabase-server.ts`의 `getWriteClient()`가
`SUPABASE_SERVICE_ROLE_KEY`(있으면) → anon(폴백) 순으로 붙는다.

**`lib/supabase-archive.ts`의 `createArchive`·`updateArchive`·`deleteArchive` 는 더 이상
화면에서 호출하지 않는다.** 새 관리 기능을 붙일 때 그걸 다시 부르면 RLS 를 조인 뒤 깨진다 —
`lib/admin-api.ts` 를 쓴다.

### RLS 상태 (2026-08-31 잠금 완료)

`archive_items` 는 **읽기가 `status='published'` 로 제한**되고 **쓰기 정책이 없다**.
정책이 없으면 거부가 기본이고 `service_role` 만 우회하므로, 서버 API 가 유일한 쓰기 경로다.

잠그기 전에는 anon key 로 INSERT 201 · DELETE 204 · draft 조회가 모두 됐다(실측).
잠근 뒤 INSERT 401 · draft 0건 · 관리자 27건 · 조회수 증가 정상.

**새 기능에서 브라우저가 Supabase 에 직접 쓰면 조용히 실패한다** —
PostgREST 는 RLS 로 걸린 UPDATE/DELETE 를 에러가 아니라 0 rows 로 돌려준다.
쓰기는 반드시 `lib/admin-api.ts` 를 거친다.

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
    ignoreBuildErrors: false,  // 2026-08-31 타입 안전망 복구
  },
  images: {
    unoptimized: true,         // 이미지 최적화 비활성화
  },
}
```

**타입 검사는 켜져 있다 (2026-08-31 변경).** 이전에는 `ignoreBuildErrors: true` 였고
`tsc --noEmit` 이 항상 exit 2 라서 안전망이 사실상 없었다. 원인이던 죽은 파일 2개를 지우고
드러난 에러 26건을 고쳐서 지금은 `pnpm build` 가 타입 검사를 실제로 돌리고 통과한다.

**다시 켜지 말 것** — 그때 가려져 있던 것 중 하나가 실제 버그였다
(`archive-content.tsx` 가 존재하지 않는 `subCategory` 를 읽어 세부 분류가 표시되지 않았다).

- `images.unoptimized` 는 Vercel 배포 시 제거 가능 (Vercel Image Optimization 사용)

### TypeScript Config

- **Path Alias**: `@/*` → 프로젝트 루트
- **Strict Mode**: 활성화
- **Target**: ES6
- **JSX**: react-jsx
- **exclude**: `node_modules`, `light-archive-mcp`, `light-archive-mcp-cf`, `.next`
  (MCP 워커는 Cloudflare 타입을 쓰는 별도 프로젝트라 제외)

## Design System

- 디자인 시스템의 기준 문서는 루트의 `DESIGN.md`입니다.
- `DESIGN.md`는 google-labs-code/design.md 형식을 따라 YAML 토큰과 적용 설명을 함께 관리합니다.
- UI 작업 시 색상, 폰트, 간격, radius, 버튼/카드/배지 규칙은 `DESIGN.md`를 우선 확인하세요.

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
