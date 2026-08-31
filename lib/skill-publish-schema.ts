/**
 * POST /api/skills 요청 스키마
 *
 * 에이전트(light-archive-publish 스킬)가 보내는 페이로드의 계약이다.
 * 스킬 쪽 로컬 검증 스크립트도 같은 규칙을 따라야 한다.
 */
import { z } from "zod"
import { skillSectionsSchema } from "./skill-sections"

/**
 * slug 는 반드시 영문으로 시작한다.
 * 기존 아카이브 id('1', '1756...-ab12cd')와 절대 겹치지 않게 하기 위한 규칙 —
 * /skills/{slug} 에서 옛 링크를 구분해 /tech 로 넘기는 판정이 이 규칙에 기댄다.
 */
export const skillSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(
    /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    "slug 는 영문 소문자로 시작하고 소문자·숫자·하이픈만 쓸 수 있습니다 (예: publish-agent-skill)"
  )

export const skillSourceSchema = z.object({
  /** owner/repo */
  repo: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/, "repo 는 owner/repo 형식이어야 합니다")
    .optional(),
  /** repo 안에서 이 스킬이 있는 경로 — 저장소 루트가 아니라 스킬 폴더로 바로 보내려는 것 */
  repoPath: z.string().trim().min(1).max(200).optional(),
  install: z.string().trim().min(1).optional(),
  skillsShUrl: z.string().url().optional(),
  internalPath: z.string().trim().min(1).optional(),
  harnesses: z.array(z.string().trim().min(1)).max(6).optional(),
})

export const skillPublishSchema = z
  .object({
    slug: skillSlugSchema,
    title: z.string().trim().min(1).max(200),
    /** 목록 카드에 노출되는 한 줄 설명 */
    description: z.string().trim().min(1).max(500),
    visibility: z.enum(["public", "internal"]).default("public"),
    status: z.enum(["draft", "published"]).default("draft"),
    author: z.string().trim().max(60).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    thumbnailUrl: z.string().url().optional(),
    source: skillSourceSchema.optional(),
    sections: skillSectionsSchema,
  })
  .superRefine((payload, ctx) => {
    // 공개 스킬은 설치 명령이 있어야 의미가 있고, 사내 전용은 내부 경로가 있어야 찾아갈 수 있다
    if (payload.visibility === "public" && !payload.source?.install) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source", "install"],
        message: "visibility=public 이면 source.install(설치 명령)이 필요합니다",
      })
    }
    if (payload.visibility === "internal" && !payload.source?.internalPath) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source", "internalPath"],
        message: "visibility=internal 이면 source.internalPath(내부 경로)가 필요합니다",
      })
    }
  })

export type SkillPublishPayload = z.infer<typeof skillPublishSchema>

/** zod 에러를 "어디가 왜 틀렸는지" 읽히는 형태로 바꾼다 */
export function formatZodIssues(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }))
}
