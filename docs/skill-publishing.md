# 스킬을 만들어 팀에 공유하기까지

에이전트 스킬 하나가 "내 맥북에만 있는 것"에서 "팀이 찾아 쓰는 것"이 되기까지의 경로다.
단계마다 담당 스킬이 다르고, **사내 전용이면 대부분을 건너뛴다.**

## 전체 흐름

```
스킬 제작            skill-author
   │
   ├─ 사내 전용이면 ────────────────────────┐
   │                                        │
   ▼                                        │
공개 게이트          create-opensource       │   라이선스·시크릿·내부 노출 판정
   │                                        │
   ▼                                        │
GitHub + skills.sh   publish-agent-skill    │   public repo, npx skills add 검증
   │                                        │
   ▼                                        ▼
아카이브 게시        light-archive-publish       archive.lightsoft.dev/skills
```

| 단계 | 담당 | 사내 전용일 때 |
|---|---|---|
| 스킬 제작·개선·eval | `skill-author` | 동일 |
| 공개 가능 판정 (라이선스·시크릿) | `create-opensource` | **건너뜀** |
| public repo + skills.sh 등록 | `publish-agent-skill` | **건너뜀** |
| 소개 페이지 게시 | `light-archive-publish` | 동일 |

## 사내 전용 스킬 — 최단 경로

만들자마자 바로 공유할 수 있다. 공개 저장소가 없어도 된다.

```
"이 스킬 아카이브에 올려줘"
```

`light-archive-publish`가 SKILL.md를 읽고 → 섹션을 골라 채우고 → 검증하고 →
draft로 올려 미리보기를 준다. 확인 후 공개하면 `/skills`에 뜬다.

카드에는 설치 명령 대신 **내부 경로**와 "사내 전용" 배지가 붙는다.

## 공개 스킬 — 전체 경로

1. `create-opensource` — 라이선스 충돌, 히스토리 시크릿, 내부 저장소 노출을 판정.
   🔴가 하나라도 있으면 여기서 멈춘다.
2. `publish-agent-skill` — 스킬 전용 public repo를 만들고 `npx skills add`가 실제로
   설치되는지, skills.sh에 색인되는지 검증.
3. `light-archive-publish` — 소개 페이지 게시. 이때 `install`은
   `npx skills add <owner>/<repo>@<skill>`이 된다.

## 게시 API

정본은 REST다. MCP가 아닌 이유는 CI·셸에서 쓰기 위해서다.

```
POST /api/skills?dryRun=1   검증만. 저장 안 함
POST /api/skills            게시 (slug 기준 upsert)
GET  /api/skills            공개 목록
GET  /api/skills/{slug}     단건
```

- **멱등** — 같은 slug면 새 글이 안 생기고 갱신된다. 스킬을 고칠 때마다 다시 올리면 된다.
- 기본 `status`는 `draft`. 응답의 `previewUrl`로 확인한 뒤 `--publish`로 공개.
- 스키마 검증 실패는 400 + `issues: [{path, message}]`.

**스키마 정본은 이 API 한 곳**이다(`lib/skill-sections.ts`).
게시 스킬은 스키마를 복사해 들고 있지 않고 `?dryRun=1`로 물어본다 —
그래서 필드가 바뀌어도 스킬 쪽이 낡아서 틀리지 않는다.

## 섹션 템플릿

| 필수 | 선택 |
|---|---|
| `hero` 이름·한줄설명·배지 | `problem` `before_after` `triggers` `steps` `demo` `scope` `metrics` `faq` `code` `related` |
| `install` 설치 명령·전제조건 | |

스킬 성격에 맞는 것만 고른다. **근거 없는 섹션은 빼는 게 지어내는 것보다 낫다** —
`metrics`에 추정치를 숫자로 쓰면 페이지 전체가 의심받는다.

필드 상세는 `light-archive-publish/references/sections.md`.

## 환경변수

| 이름 | 어디에 |
|---|---|
| `LIGHT_ARCHIVE_PUBLISH_TOKEN` | `.env.local`(로컬) + Vercel 환경변수(운영). 없으면 게시가 전부 401 |
| `SKILL_PREVIEW_TOKEN` | 동일. draft 미리보기 URL에 쓰인다 |
| `LIGHT_ARCHIVE_HOST` | 게시하는 쪽(스킬)에서 씀. 기본 `https://archive.lightsoft.dev` |

로컬에서 테스트할 때:

```bash
export LIGHT_ARCHIVE_HOST=http://localhost:3000
export LIGHT_ARCHIVE_PUBLISH_TOKEN=$(grep LIGHT_ARCHIVE_PUBLISH_TOKEN .env.local | sed 's/.*=//')
node ~/skills/macbook-cc/light-archive-publish/scripts/preflight.mjs
```

## 트러블슈팅

| 증상 | 원인 |
|---|---|
| 게시가 401 | `LIGHT_ARCHIVE_PUBLISH_TOKEN` 미설정 또는 불일치. `preflight.mjs`로 먼저 확인 |
| 게시가 400 + issues | 페이로드 스키마 위반. `issues[].path`가 어느 필드인지 알려준다 |
| 게시는 됐는데 페이지가 404 | `status`가 `draft`다. `previewUrl`로 보거나 `--publish`로 공개 |
| `column ... does not exist` | `supabase/migrations/003_skill_catalog.sql` 미적용 |
| `/skills/{옛 id}`로 들어옴 | 자동으로 `/tech/{id}`로 308 리다이렉트된다 (정상) |

## 관련 문서

- `docs/skill-catalog-plan.md` — 왜 이렇게 설계했는지(결정 근거)
- `CLAUDE.md` 「에이전트 스킬 카탈로그」 — 모듈 위치와 데이터 모델
- `docs/backlog.md` — 아직 안 고친 것들
