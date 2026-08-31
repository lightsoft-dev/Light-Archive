/**
 * 스킬 상세 페이지의 섹션 템플릿 스키마
 *
 * 왜 JSON 인가 — 에이전트가 HTML 을 직접 만들면 검증할 방법이 없고 스타일이 매번 갈린다.
 * 섹션을 타입 + data 로 고정하면 (1) 서버에서 스키마 검증이 되고 (2) 렌더는 우리 컴포넌트가
 * 하므로 디자인이 항상 일정하다.
 *
 * 이 파일 하나가 정본이다 — 게시 API 검증과 프론트 렌더 타입이 여기서 같이 나온다.
 */
import { z } from "zod"

// ---------------------------------------------------------------------------
// 공통 조각
// ---------------------------------------------------------------------------

const nonEmpty = z.string().trim().min(1)
const phraseList = z.array(nonEmpty).min(1).max(10)

// ---------------------------------------------------------------------------
// 섹션별 스키마
// ---------------------------------------------------------------------------

/** 1. hero — 필수. 무엇을 하는 스킬인지 한 문장 + 배지 */
export const heroSchema = z.object({
  type: z.literal("hero"),
  data: z.object({
    tagline: nonEmpty.max(200),
    badges: z.array(z.object({ label: nonEmpty, value: nonEmpty })).max(4).optional(),
  }),
})

/** 2. install — 필수. 설치 명령과 전제조건 */
export const installSchema = z.object({
  type: z.literal("install"),
  data: z.object({
    command: nonEmpty,
    note: z.string().optional(),
    prerequisites: z.array(nonEmpty).max(8).optional(),
    envVars: z.array(z.object({ name: nonEmpty, purpose: nonEmpty })).max(8).optional(),
  }),
})

/** 3. problem — 어떤 반복작업을 없애나 */
export const problemSchema = z.object({
  type: z.literal("problem"),
  data: z.object({
    context: z.string().optional(),
    pains: phraseList,
  }),
})

/** 4. before_after — 수작업 vs 스킬 */
const sideSchema = z.object({
  title: nonEmpty,
  steps: z.array(nonEmpty).min(1).max(8),
  cost: z.string().optional(), // "40분", "매번 3회 왕복" 등
})
export const beforeAfterSchema = z.object({
  type: z.literal("before_after"),
  data: z.object({ before: sideSchema, after: sideSchema }),
})

/** 5. triggers — 이렇게 말하면 발동한다 */
export const triggersSchema = z.object({
  type: z.literal("triggers"),
  data: z.object({
    phrases: phraseList,
    notFor: z.array(nonEmpty).max(6).optional(),
  }),
})

/** 6. steps — 동작 흐름 */
export const stepsSchema = z.object({
  type: z.literal("steps"),
  data: z.object({
    steps: z
      .array(z.object({ title: nonEmpty, detail: nonEmpty, output: z.string().optional() }))
      .min(2)
      .max(10),
  }),
})

/** 7. demo — GIF·스크린샷·영상 */
export const demoSchema = z.object({
  type: z.literal("demo"),
  data: z.object({
    media: z
      .array(
        z.object({
          kind: z.enum(["image", "gif", "video"]),
          url: z.string().url(),
          caption: z.string().optional(),
        })
      )
      .min(1)
      .max(6),
  }),
})

/** 8. scope — 하는 일 / 안 하는 일 */
export const scopeSchema = z.object({
  type: z.literal("scope"),
  data: z.object({
    does: z.array(nonEmpty).min(1).max(8),
    doesNot: z.array(nonEmpty).min(1).max(8),
  }),
})

/** 9. metrics — 수치 개선 */
export const metricsSchema = z.object({
  type: z.literal("metrics"),
  data: z.object({
    items: z
      .array(z.object({ label: nonEmpty, before: nonEmpty, after: nonEmpty, unit: z.string().optional() }))
      .min(1)
      .max(4),
  }),
})

/** 10. faq — 자주 막히는 지점 */
export const faqSchema = z.object({
  type: z.literal("faq"),
  data: z.object({
    items: z.array(z.object({ q: nonEmpty, a: nonEmpty })).min(1).max(10),
  }),
})

/** 11. code — 코드·설정 예시 */
export const codeSchema = z.object({
  type: z.literal("code"),
  data: z.object({
    language: z.string().default("bash"),
    code: nonEmpty,
    caption: z.string().optional(),
  }),
})

/** 12. related — 관련 스킬 */
export const relatedSchema = z.object({
  type: z.literal("related"),
  data: z.object({
    slugs: z.array(nonEmpty).min(1).max(6),
  }),
})

// ---------------------------------------------------------------------------
// 유니온
// ---------------------------------------------------------------------------

export const REQUIRED_SECTION_TYPES = ["hero", "install"] as const

/** 문서 구조상 한 번만 나와야 하는 섹션 (code 는 여러 개 가능) */
export const SINGLETON_SECTION_TYPES: string[] = [
  "hero",
  "install",
  "problem",
  "before_after",
  "triggers",
  "steps",
  "scope",
  "metrics",
  "faq",
  "related",
]

export const skillSectionSchema = z.discriminatedUnion("type", [
  heroSchema,
  installSchema,
  problemSchema,
  beforeAfterSchema,
  triggersSchema,
  stepsSchema,
  demoSchema,
  scopeSchema,
  metricsSchema,
  faqSchema,
  codeSchema,
  relatedSchema,
])

export type SkillSection = z.infer<typeof skillSectionSchema>
export type SkillSectionType = SkillSection["type"]

/** 섹션 배열 — 필수 섹션이 빠지면 여기서 걸린다 */
export const skillSectionsSchema = z
  .array(skillSectionSchema)
  .min(1)
  .max(20)
  .superRefine((sections, ctx) => {
    const types = sections.map((s) => s.type)
    for (const required of REQUIRED_SECTION_TYPES) {
      if (!types.includes(required)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `필수 섹션 '${required}' 이(가) 없습니다. 필수: ${REQUIRED_SECTION_TYPES.join(", ")}`,
        })
      }
    }
    const seen = new Set<string>()
    for (const t of types) {
      if (SINGLETON_SECTION_TYPES.includes(t) && seen.has(t)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `섹션 '${t}' 은(는) 한 번만 쓸 수 있습니다.`,
        })
      }
      seen.add(t)
    }
  })

// ---------------------------------------------------------------------------
// 카탈로그 — 에이전트가 번호로 섹션을 고를 때 참조한다
// ---------------------------------------------------------------------------

export interface SectionCatalogEntry {
  no: number
  type: SkillSectionType
  label: string
  required: boolean
  summary: string
}

export const SECTION_CATALOG: SectionCatalogEntry[] = [
  { no: 1, type: "hero", label: "히어로", required: true, summary: "이름·한줄설명·배지" },
  { no: 2, type: "install", label: "설치", required: true, summary: "설치 명령 + 전제조건·환경변수" },
  { no: 3, type: "problem", label: "문제", required: false, summary: "어떤 반복작업을 없애나" },
  { no: 4, type: "before_after", label: "비포/애프터", required: false, summary: "수작업 vs 스킬 비교" },
  { no: 5, type: "triggers", label: "트리거", required: false, summary: "이렇게 말하면 발동한다" },
  { no: 6, type: "steps", label: "동작 흐름", required: false, summary: "1 → 2 → 3 단계" },
  { no: 7, type: "demo", label: "데모", required: false, summary: "GIF·스크린샷·영상" },
  { no: 8, type: "scope", label: "범위", required: false, summary: "하는 일 / 안 하는 일" },
  { no: 9, type: "metrics", label: "수치", required: false, summary: "40분 → 3분" },
  { no: 10, type: "faq", label: "FAQ", required: false, summary: "자주 막히는 지점" },
  { no: 11, type: "code", label: "코드", required: false, summary: "코드·설정 예시" },
  { no: 12, type: "related", label: "관련 스킬", required: false, summary: "함께 쓰는 스킬" },
]

/** 스킬 성격별 권장 조합 — light-archive-publish 스킬이 참조한다 */
export const SECTION_PRESETS: Record<string, number[]> = {
  "수작업 자동화": [1, 2, 3, 4, 5, 8],
  "판단·검증 절차": [1, 2, 3, 5, 6, 8, 10],
  "산출물 생성": [1, 2, 5, 7, 9],
  "외부 서비스 연동": [1, 2, 5, 6, 10, 11],
}
