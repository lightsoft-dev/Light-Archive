# Backlog

작업 중 발견했지만 그 자리에서 고치지 않고 적립한 것들. 근거와 트리거를 함께 남긴다.

---

## 🟡 archive_items RLS 개방 — 코드는 준비 완료, **service_role 키 대기**

**발견** 2026-08-31 · **실측 확인** 같은 날 (pg_policies 조회)

`archive_items`의 정책 4개가 전부 `{public}` 역할에 `true`다. anon key는 공개 사이트의
브라우저 번들에 들어 있으므로, **그 키를 읽은 누구나 아카이브를 위조·수정·삭제할 수 있다.**

```
archive_items_select_policy   SELECT  {public}  USING (true)
archive_items_insert_policy   INSERT  {public}  WITH CHECK (true)
archive_items_update_policy   UPDATE  {public}  USING (true)
archive_items_delete_policy   DELETE  {public}  USING (true)
```

### 끝난 것 (2026-08-31)

| 선결 조건 | 상태 |
|---|---|
| 관리자 인증을 서버로 이관 | ✅ `POST /api/admin/session` — 비밀번호 서버 검증 + httpOnly 서명 쿠키 |
| 관리자 쓰기를 서버 API로 이관 | ✅ `/api/admin/archives` GET·POST, `/{id}` GET·PATCH·DELETE |
| 브라우저의 Supabase 직접 쓰기 제거 | ✅ 잔존 0건 (`createArchive`·`updateArchive`·`deleteArchive` 호출 없음) |
| 조회수 함수 RLS 우회 | ✅ 004 마이그레이션 — `SECURITY DEFINER` + `search_path` 고정 |
| 정책 교체 SQL | ✅ `supabase/migrations/005_lock_down_rls.sql` (작성만, 미적용) |

### 남은 것 — 사람만 할 수 있는 일

`SUPABASE_SERVICE_ROLE_KEY`를 Supabase 대시보드에서 가져와
`.env.local`과 Vercel 환경변수에 넣어야 한다. **MCP로는 얻을 수 없다**(publishable 키만 제공).
`NEXT_PUBLIC_` 접두사를 붙이면 안 된다 — 붙이는 순간 브라우저로 새어 나가 지금보다 나빠진다.

키가 들어오면 `005_lock_down_rls.sql`을 적용하고 그 파일 3번 항목의 검증 5개를 돌린다.

**트리거** — 아카이브를 외부에 홍보하기 전 / 사내 외 트래픽이 붙기 전.

**관련** `docs/skill-catalog-plan.md` 9장, 아래 「ERP와 DB 공유」 항목

---

## 🟠 Light Archive가 회사 ERP와 같은 Supabase 프로젝트를 쓴다

**발견** 2026-08-31 (RLS 정책 조회 중)

`tjucmfulpsbarmmxfeao` 한 프로젝트에 Light Archive 테이블(`archive_items`,
`archive_comments`)과 **회사 ERP 테이블이 함께 있다** — `quotations` `quotation_items`
`expenses` `receipts` `payments` `journal_entries` `projects` `pipelines` `users` 등.

문제가 두 겹이다.

1. **service_role 키의 폭발 반경** — 위 RLS 작업에 필요한 그 키는 ERP 테이블까지 전권을
   준다. 공개 사이트인 Light Archive가 침해되면 견적·지출·급여 데이터까지 노출된다.
2. **실수의 폭발 반경** — Light Archive 마이그레이션을 잘못 돌리면 ERP를 건드린다.
   이번 작업에서도 `DROP CONSTRAINT`를 칠 때 대상 테이블을 두 번 확인해야 했다.

**대응** — Light Archive용 Supabase 프로젝트를 새로 파고 `archive_items`·
`archive_comments`·`thumbnails` 버킷을 옮긴다. 데이터가 27행·댓글 소량이라 이전 자체는 가볍다.
비용(Supabase 무료 프로젝트 한도)과 마이그레이션 시점 조율이 실제 관문이다.

**트리거** — service_role 키를 넣기 전에 결정하는 게 가장 싸다. 지금이 그 시점이다.

---

## ✅ 사이트 기본 도메인이 두 개로 갈려 있었다 — 해결 (2026-08-31)

**발견** 2026-08-31 (라우트 이관 중)

| 값 | 쓰는 곳 |
|---|---|
| `https://light-archive.vercel.app` | `app/layout.tsx:37,84`(metadataBase·OG), `app/sitemap.ts:4`, `app/robots.ts:12`, `components/structured-data.tsx:19,26,33,44` |
| `https://archive.lightsoft.dev` | `app/admin/page.tsx:305`(링크 복사), `lib/og-image.tsx:139`(OG 푸터 표기) |

실서비스 도메인이 `archive.lightsoft.dev`라면 canonical·OG·sitemap·JSON-LD가 전부
vercel.app을 가리키고 있어 **검색엔진이 두 도메인을 중복 문서로 취급**한다.

**대응** — Vercel 프로젝트의 Production Domain을 확인해 정본을 확정하고,
`NEXT_PUBLIC_SITE_URL` 하나로 모아 8곳을 그 값으로 교체. 하드코딩 금지.

**해결** — `lib/site.ts`의 `SITE_URL` 하나로 모으고 8곳을 교체했다.
기본값은 `https://archive.lightsoft.dev`이고 `NEXT_PUBLIC_SITE_URL`로 덮어쓸 수 있다.
실측: sitemap.xml·robots.txt가 정본 도메인을 가리키는 것을 확인.
(두 도메인이 **둘 다 200**으로 응답하고 있었으므로 중복 색인이 실재했다)

---

## ✅ admin 컴포넌트 2개가 파싱 불가능한 죽은 파일이었다 — 해결 (2026-08-31)

**발견** 2026-08-31 (타입체크 중)

`components/admin/login-dialog.tsx`, `components/admin/posts-table.tsx`가 TSX가 아니라
**AI 도구의 출력 텍스트**를 그대로 저장한 파일이다. 1~5행이 "Copy - paste this component to
/components/ui folder:" 산문이고 6행이 마크다운 코드펜스(```tsx)다.

```
components/admin/login-dialog.tsx(6,1): error TS1127: Invalid character.
components/admin/posts-table.tsx(730,1): error TS1160: Unterminated template literal.
```

어디서도 import되지 않아 런타임 영향은 없다. 문제는 **`npx tsc --noEmit`이 항상 exit 2**라서
타입체크로 회귀를 잡을 수 없다는 것 — 지금은 이 4줄을 눈으로 걸러내야 진짜 에러가 보인다.
`next.config.mjs`의 `ignoreBuildErrors: true`와 겹쳐서 타입 안전망이 사실상 없다.

**해결** — 두 파일을 삭제하니 가려져 있던 **진짜 에러 26건**이 드러났고 전부 고쳤다.

| 고친 것 | 내용 |
|---|---|
| `archive-content.tsx` | **실제 버그** — 존재하지 않는 `archive.subCategory`를 읽어 상세 페이지 세부 분류가 항상 표시되지 않았다 (`sub_category`로 수정) |
| `types/archive.ts` | 중복 re-export 제거 |
| `mock/projects.ts`·`mock/skills.ts` | `viewCount`·`subCategory` → DB 컬럼명과 일치 |
| `ui/dialog.tsx` | `showCloseButton` prop 추가 (command 팔레트가 요구하던 것) |
| `archive-card.tsx` | `id` 타입을 실제 데이터에 맞게 `string | number` |
| `tsconfig.json` | 별도 워커 프로젝트(`light-archive-mcp*`) exclude |

그다음 `next.config.mjs`의 `ignoreBuildErrors`를 **false로 바꿨다**.
이제 `pnpm build`가 타입 검사를 실제로 돌리고 통과한다(로그에 `Running TypeScript ...`).

**남은 것** — `components/archive-list.tsx`·`archive-card.tsx`와 `mock/posts·projects·skills`는
여전히 사용처 0건이고 `archive-card`는 존재하지 않는 `/post/{id}`로 링크한다.
타입은 맞춰뒀으니 급하지 않지만, 쓸 계획이 없으면 지우는 게 맞다(판단 필요).

---

## ℹ️ dev 서버에서 매 요청마다 ByteString TypeError

**발견** 2026-08-31 · **원인 후보 3개 배제함** (같은 날 추가 조사)

`pnpm dev`로 띄우면 **모든 페이지 요청마다** 아래가 찍힌다. 응답은 200이라 화면은 정상이다.

```
⨯ TypeError: Cannot convert argument to a ByteString because the character at
   index 120 has a value of 44032 which is greater than 255.   (44032 = U+AC00 '가')
  digest: '2819571516'
```

### 좁힌 범위 (전부 실측)

| 가설 | 결과 |
|---|---|
| 프로덕션에서도 나나 | **아니다** — `pnpm build && pnpm start` 0건 (dev 6건). dev 전용 |
| `agentation`(DevTools) | **아니다** — 렌더를 막아도 요청 2회에 에러 2건 그대로 |
| `StructuredData` + `Analytics` | **아니다** — 둘 다 제거해도 요청 1회에 1건 |
| 코드의 문자열 리터럴 | **아니다** — 120번째 글자가 '가'인 리터럴 0건 (전수 스캔) |
| metadata의 description/keywords | **아니다** — 후보 5개 모두 120자 미만 |

남은 후보는 런타임에 조합되는 문자열을 dev 전용 경로가 헤더에 넣는 것이다
(Turbopack dev overlay, HMR, next/font 등).

**영향** — 사용자 영향 없음. 다만 dev 콘솔에서 **진짜 에러를 가린다**(매 요청 4줄).

**다음에 볼 것** — `digest: '2819571516'`로 Next.js 이슈 검색, 또는 layout을 빈 껍데기로
줄여가며 이분 탐색. Next.js 16.1.6 / Turbopack.

**트리거** — dev 콘솔 노이즈가 디버깅을 방해할 때, 또는 Next를 올릴 때.
