# Light Archive

[archive.lightsoft.dev](https://archive.lightsoft.dev) — 라이트소프트의 기술 글·프로젝트·에이전트 스킬 아카이브.

밖으로는 팀의 기술력을 보여주고, 안으로는 지식을 쌓아 다시 쓰는 곳이다.

---

## 시작하기

필요한 것: **Node 22+**, **pnpm**, **[1Password CLI](https://developer.1password.com/docs/cli/get-started/)**(`brew install 1password-cli`), 그리고 1Password `Shared` 볼트 접근 권한.

```bash
git clone https://github.com/lightsoft-dev/Light-Archive.git
cd Light-Archive
pnpm install

op signin                             # 1Password 로그인
op inject -i .env.op -o .env.local     # 실제 .env.local 생성

pnpm dev                              # http://localhost:3000
```

`op inject`가 `too few '/'`나 권한 오류로 실패하면 `Shared` 볼트 공유를 요청한다.

### 환경변수를 왜 이렇게 받나

**`.env.op`는 저장소에 커밋돼 있다.** 실제 값이 아니라 1Password 참조(`op://…`)만 담기 때문이다.
`op inject`가 그 참조를 진짜 값으로 바꿔 `.env.local`을 만든다(`.env.local`은 커밋되지 않는다).

이렇게 하면 키를 슬랙으로 주고받을 일이 없고, **값을 바꿀 때 1Password 항목 하나만 고치면 된다** —
각자의 `.env.local`도, 저장소도 손댈 필요가 없다.

| 값 | 1Password 항목 (`Shared` 볼트) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `OPENAI_API_KEY`, `LIGHT_ARCHIVE_PUBLISH_TOKEN`, `SKILL_PREVIEW_TOKEN`, `ADMIN_SESSION_SECRET` | **Light Archive - 개발 환경변수** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 라이트소프트 ERP - Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 라이트소프트 ERP - Supabase service_role key |
| 운영 `ADMIN_PASSWORD` | **Light Archive - 관리자 계정** (로컬은 아무 값이나 된다) |

Supabase 키만 ERP 항목을 참조하는 이유는 **같은 Supabase 프로젝트를 공유**하기 때문이다.
같은 값을 두 항목에 복사해두면 로테이션할 때 한쪽만 바뀌어 갈린다.

---

## 구성

| 경로 | 내용 |
|---|---|
| `/` | 아카이브 홈 |
| `/tech`, `/tech/[id]` | 기술 아카이브 |
| `/skills`, `/skills/[slug]` | 에이전트 스킬 카탈로그 (사내 전용 스킬은 로그인해야 보인다) |
| `/projects`, `/projects/[id]` | 프로젝트 아카이브 |
| `/admin` | 관리자 — 글 작성·수정·발행, 스킬 섹션 편집 |
| `app/api/` | 게시 API(`POST /api/skills`), 관리 API(`/api/admin/*`), MCP 엔드포인트(`/api/mcp`) |

Next.js 16 · React 19 · Supabase · Radix UI · Tailwind CSS.

```bash
pnpm dev     # 개발 서버
pnpm build   # 프로덕션 빌드 (타입 검사 포함)
pnpm lint
```

---

## 배포

Vercel 프로젝트 `light-archive`가 이 저장소에 연결돼 있다. **`main`에 푸시하면 프로덕션이 자동 배포**된다.

운영 환경변수는 `.env.op`가 아니라 Vercel 프로젝트 설정에 따로 등록돼 있다.
값을 바꿀 때는 **1Password와 Vercel 양쪽을 같이** 갱신한다.

---

## 더 읽을 것

| 문서 | 내용 |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | 아키텍처, 인증·쓰기 경로, RLS 상태, 스킬 카탈로그 구조 |
| [`DESIGN.md`](DESIGN.md) | 디자인 시스템 (색·타이포·간격·컴포넌트 규칙) |
| [`docs/`](docs) | 기획서, Supabase 가이드, 스킬 게시 절차, 백로그 |
