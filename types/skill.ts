/**
 * 에이전트 스킬 카탈로그 타입
 *
 * 저장소는 archive_items 테이블이며 category = '스킬' 인 행이 카탈로그에 노출된다.
 * (신규 테이블을 만들지 않은 이유는 docs/skill-catalog-plan.md D6 참조)
 */
import type { SkillSection } from "@/lib/skill-sections"
import type { ArchiveStatus } from "@/types/archive"

/** public = skills.sh 등으로 외부 설치 가능 / internal = 사내 전용 */
export type SkillVisibility = "public" | "internal"

/** archive_items.skill_meta (JSONB) 의 형태 */
export interface SkillMeta {
  visibility: SkillVisibility
  /** owner/repo — public 일 때 */
  repo?: string
  /** 복사해서 바로 쓰는 설치 명령 */
  install?: string
  skillsShUrl?: string
  /** internal 일 때 안내할 내부 경로 */
  internalPath?: string
  /** 지원 하네스: claude-code, codex 등 */
  harnesses?: string[]
}

/** 카탈로그 아이템 (archive_items 행에서 스킬에 필요한 것만) */
export interface SkillCatalogItem {
  id: string
  slug: string
  title: string
  /** 목록 카드에 노출되는 한 줄 설명 (archive_items.description) */
  description: string
  status?: ArchiveStatus
  author?: string
  tags?: string[]
  sections?: SkillSection[] | null
  skill_meta?: SkillMeta | null
  view_count?: number
  comment_count?: number
  thumbnail_url?: string
  created_at?: string
  updated_at?: string
  published_at?: string
}

export const SKILL_CATEGORY = "스킬" as const
