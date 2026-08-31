# 에이전트 스킬 카탈로그 기획 (v1)

작성일 2026-08-31 · 상태 **기획 확정, 구현 착수 전**

## 1. 목적

사내에서 만든 에이전트 스킬을 **한 곳에서 보고 바로 설치할 수 있게** 한다.
`publish-agent-skill`(GitHub public + skills.sh 유통)이 끝나는 지점에서 이어받아,
archive.lightsoft.dev에 소개 페이지를 **에이전트가 자동으로** 만든다.

기존 `/skills`(기술 아카이브 글)와 이름이 충돌하므로 기존 것을 `/tech`로 옮기고
`/skills` 자리를 스킬 카탈로그에 내준다.

## 2. 확정된 결정

| # | 결정 | 근거 |
|---|---|---|
| D1 | `/tech` = 기존 기술 아카이브, `/skills` = 신규 스킬 카탈로그 | 데이터 모델이 다르다(설치 명령·repo·트리거) |
| D2 | 공개 스킬 + 사내 전용 스킬 **둘 다** 게시 | 팀 내 지식 공유가 주목적이라 private 쪽이 더 많다 |
| D3 | 발행은 `draft`/`published` **둘 다 가능**, 기본값 `draft` | 즉시 공개는 플래그로. 기본을 draft로 둬야 오탈자가 대외 노출되지 않는다 |
| D4 | 필수 섹션 2개 + 선택 섹션 자유 조합 | 스킬 성격마다 필요한 섹션이 다르다 |
| D5 | 본문은 HTML이 아니라 **`sections` JSONB** | 에이전트가 만든 HTML은 검증이 안 되고 스타일이 매번 갈린다. JSON은 스키마 검증 가능 |
| D6 | 저장은 신규 테이블이 아니라 **`archive_items` 확장** | 댓글·조회수·검색·OG이미지·관련항목이 이미 이 테이블에 묶여 있다. 신규 테이블은 그걸 전부 다시 짜야 한다 |
| D7 | 게시 정본은 **REST `/api/skills`**, MCP 도구는 그걸 호출 | MCP는 세션 오버헤드가 있어 CI·스크립트에서 못 쓴다 |

## 3. 정보 구조

```
/tech               기존 기술 아카이브 목록      (category = '기술')
/tech/[id]          기존 상세 (HTML content)
/skills             ★ 스킬 카탈로그              (category = '스킬')
/skills/[slug]      ★ 섹션 템플릿 상세
```

- `/skills` → `/tech` **301 리다이렉트**는 두지 않는다. `/skills`가 새 페이지로 살아있기 때문.
  대신 기존 상세 URL `/skills/{id}`(타임스탬프형 id)만 `/tech/{id}`로 301 처리한다.
  slug는 영문 케밥케이스, 기존 id는 `1756...-ab12cd` 형태라 정규식으로 구분 가능.
- 코드 수정 대상 12곳: `app/sitemap.ts`, `app/skills/layout.tsx`, `app/skills/page.tsx`,
  `app/skills/[id]/page.tsx`, `components/mock/nav-items.ts`(3곳),
  `components/ui/footer-section.tsx`, `components/related-archives{,-section}.tsx`(4곳),
  `components/recommended-articles.tsx`, `components/related-skills-section.tsx`

## 4. 데이터 모델

`archive_items`에 컬럼 4개만 추가한다. 스킬 고유 필드는 JSONB로 묶어 컬럼 증식을 막는다.

```sql
ALTER TABLE archive_items ADD COLUMN slug TEXT UNIQUE;      -- /skills/{slug}, upsert 키
ALTER TABLE archive_items ADD COLUMN sections JSONB;        -- 섹션 배열 (스킬 전용)
ALTER TABLE archive_items ADD COLUMN skill_meta JSONB;      -- 아래 참조
-- category CHECK 제약에 '스킬' 추가
```

`skill_meta` 형태:

```json
{
  "visibility": "public",              // public | internal
  "repo": "woorichicken/publish-agent-skill",
  "install": "npx skills add woorichicken/publish-agent-skill",
  "skillsShUrl": "https://skills.sh/...",
  "internalPath": "~/skills/macbook-cc/publish-agent-skill",
  "harnesses": ["claude-code", "codex"]
}
```

- `visibility: internal`이면 카드·상세에 "사내 전용" 배지를 달고 `install` 대신 `internalPath` 안내를 띄운다.
- 기존 글(`content` HTML)은 그대로 둔다. 상세 렌더러가 `sections`가 있으면 섹션 렌더, 없으면 기존 HTML 렌더로 분기한다.

## 5. 섹션 템플릿 카탈로그

필수 2개는 항상 들어가고, 나머지는 에이전트가 번호로 고른다(예: `3,4,5,8`).

| # | type | 용도 | data 스키마 |
|---|---|---|---|
| 1 | `hero` **필수** | 이름·한줄설명·배지 | `{ tagline, badges?: [{label,value}] }` |
| 2 | `install` **필수** | 설치 명령·전제조건 | `{ command, prerequisites?: string[], envVars?: [{name,purpose}] }` |
| 3 | `problem` | 어떤 반복작업을 없애나 | `{ pains: string[], context? }` |
| 4 | `before_after` | 수작업 vs 스킬 | `{ before: {title, steps[], cost?}, after: {title, steps[], cost?} }` |
| 5 | `triggers` | 발동 문장 예시 | `{ phrases: string[], notFor?: string[] }` |
| 6 | `steps` | 동작 흐름 | `{ steps: [{title, detail, output?}] }` |
| 7 | `demo` | GIF·스크린샷 | `{ media: [{kind:"image"\|"gif"\|"video", url, caption}] }` |
| 8 | `scope` | 하는 일 / 안 하는 일 | `{ does: string[], doesNot: string[] }` |
| 9 | `metrics` | 수치 개선 | `{ items: [{label, before, after, unit?}] }` |
| 10 | `faq` | 자주 막히는 지점 | `{ items: [{q, a}] }` |
| 11 | `code` | 코드/설정 예시 | `{ language, code, caption? }` |
| 12 | `related` | 관련 스킬 | `{ slugs: string[] }` |

각 타입은 `components/skill-sections/<type>.tsx` 하나에 대응한다.
JSON에 없는 타입이 오면 렌더를 건너뛰고 콘솔 경고만 남긴다(배포 중 깨짐 방지).

### 에이전트의 섹션 선택 기준

| 스킬 성격 | 권장 조합 |
|---|---|
| 수작업을 자동화 (배포·정리·변환) | 1,2,3,4,5,8 |
| 판단·검증 절차 (리뷰·감사·게이트) | 1,2,3,5,6,8,10 |
| 화면·산출물을 만드는 것 | 1,2,5,7,9 |
| 외부 서비스 연동 | 1,2,5,6,10,11 |

## 6. API 계약

```
POST   /api/skills           게시 (slug 기준 upsert)   Bearer 인증
GET    /api/skills           목록 (published + public)
GET    /api/skills/{slug}    상세
```

요청:

```json
{
  "slug": "publish-agent-skill",
  "title": "스킬 하나를 public repo로 패키징해서 skills.sh까지",
  "summary": "한 줄 설명 (목록 카드에 노출)",
  "visibility": "public",
  "status": "draft",
  "author": "정경훈",
  "tags": ["claude-code", "배포"],
  "source": { "repo": "...", "install": "...", "skillsShUrl": "...", "internalPath": "..." },
  "sections": [ { "type": "hero", "data": { "tagline": "..." } } ]
}
```

응답:

```json
{ "ok": true, "slug": "...", "action": "created",
  "status": "draft",
  "url": "https://archive.lightsoft.dev/skills/publish-agent-skill",
  "previewUrl": "https://archive.lightsoft.dev/skills/publish-agent-skill?preview=<token>" }
```

규칙:
- **멱등** — 같은 slug로 다시 호출하면 새 글이 생기지 않고 갱신된다(`action: "updated"`).
- 서버가 섹션 스키마를 검증한다. 필수 섹션 누락·알 수 없는 type·필수 필드 누락이면 `400`과 함께 어떤 섹션의 어떤 필드가 문제인지 돌려준다.
- 인증은 `Authorization: Bearer $LIGHT_ARCHIVE_PUBLISH_TOKEN`(Vercel env).

## 7. 게시 스킬 — `light-archive-publish` (신규)

`erp-site-publish` 네이밍을 따른다. `publish-agent-skill`과는 경계가 다르다:
저쪽은 GitHub·skills.sh 유통, 이쪽은 아카이브 소개 페이지. 사내 전용 스킬은 저쪽을 거치지 않고
바로 이쪽만 쓴다.

워크플로우:

1. 대상 스킬의 `SKILL.md`·`scripts/`·`references/`를 읽는다
2. 공개 범위 판정 — public repo가 있으면 `public`, 없으면 `internal`
3. 섹션 조합 선택 (5장 판정 표)
4. 섹션 내용 작성 — 근거는 SKILL.md에서 뽑고, **없는 내용을 지어내지 않는다**(해당 섹션을 뺀다)
5. `validate-payload.mjs`로 로컬 스키마 검증
6. `POST /api/skills` (기본 `draft`)
7. 미리보기 URL 보고 → 사용자 승인 시 `status: "published"`로 재호출

`publish-agent-skill` 6단계(원격 검증) 이후 "아카이브에도 올릴까요?"로 이 스킬에 위임한다.

## 8. 작업 순서

| Phase | 내용 | 산출 |
|---|---|---|
| 1 | `/skills` → `/tech` 이관 + 상세 301 | 라우트 12곳, sitemap, nav |
| 2 | DB 마이그레이션 `003_skill_catalog.sql` | slug·sections·skill_meta·category 제약 |
| 3 | 섹션 컴포넌트 12종 + 상세 렌더러 분기 | `components/skill-sections/` |
| 4 | `/skills` 카탈로그 목록 페이지 | 설치 명령 복사 버튼, 사내/공개 배지 |
| 5 | `POST /api/skills` + 스키마 검증 + 토큰 인증 | `app/api/skills/route.ts` |
| 6 | `light-archive-publish` 스킬 | SKILL.md + validate 스크립트 |
| 7 | 프로세스 문서 + 첫 스킬 게시(dogfooding) | `docs/` + CLAUDE.md 인덱스 |

## 9. 리스크

### 🔴 RLS가 완전히 열려 있다 (선결 과제)

`001_create_archive_tables.sql`의 정책이 SELECT/INSERT/UPDATE/DELETE 전부 `USING (true)`다.
anon key는 공개 사이트의 브라우저 번들에 들어 있으므로, **현재 누구나 아카이브 글을 위조하거나
지울 수 있다.** API에 토큰 인증을 붙여도 Supabase를 직접 때리면 우회된다.

실측 명령(구현 착수 시 첫 순서):

```bash
curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/archive_items" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"rls-probe","title":"probe","category":"기술","status":"draft"}'
# 201이면 열려 있는 것 → 즉시 정책 교체 후 probe 행 삭제
```

대응: 읽기만 anon에 허용하고 쓰기는 `service_role`로 좁힌다. API 라우트는 서버에서만
service key를 쓴다(`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_` 접두사 금지).
admin UI의 쓰기 경로도 같이 API로 옮겨야 하므로 Phase 5와 묶는다.

### 그 외

| 리스크 | 대응 |
|---|---|
| 기존 `/skills/{id}` 외부 링크·검색 색인 | 상세만 `/tech/{id}`로 301, slug 형태로 신구 구분 |
| 에이전트가 없는 내용을 지어냄 | 근거 없는 섹션은 생략. 기본 `draft`로 사람이 확인 |
| 섹션 스키마 변경 시 기존 글 깨짐 | 알 수 없는 type은 렌더 건너뛰기. `sections`에 `version` 필드 |
| `category` CHECK 제약 | 마이그레이션에서 '스킬' 추가 안 하면 INSERT 전부 실패 |

## 10. 미결

- 카탈로그 정렬 기준 — 최신순 / 설치수 / 조회수. 설치수는 skills.sh에서 못 긁어오면 조회수로.
- 스킬 목록에 검색·태그 필터를 1차부터 넣을지
- OG 이미지 — 스킬용 별도 템플릿(설치 명령 노출) 필요 여부
