/**
 * 에이전트 스킬 카탈로그 조회 (/skills)
 *
 * 저장소는 archive_items 이며 category = '스킬' 인 행만 다룬다.
 * 기술 아카이브(category='기술', /tech)와 테이블을 공유하지만 조회 경로는 완전히 분리한다.
 */
import { supabase } from "./supabase"
import { SKILL_CATEGORY, type SkillCatalogItem } from "@/types/skill"

/** 카탈로그·상세에서 공통으로 쓰는 컬럼 */
const SKILL_COLUMNS =
  "id, slug, title, description, status, author, tags, sections, skill_meta, view_count, comment_count, thumbnail_url, created_at, updated_at, published_at"

/** 공개된 스킬 목록 (최신순) */
export async function getSkillCatalog(): Promise<SkillCatalogItem[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select(SKILL_COLUMNS)
    .eq("category", SKILL_CATEGORY)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching skill catalog:", error)
    return []
  }

  return (data as SkillCatalogItem[]) || []
}

/**
 * slug 로 스킬 하나 조회
 *
 * includeDraft 는 미리보기 전용이다. 호출부(서버 컴포넌트)에서 preview 토큰을
 * 검증한 뒤에만 true 로 넘긴다 — 클라이언트에서 임의로 켤 수 없어야 한다.
 */
export async function getSkillBySlug(
  slug: string,
  includeDraft = false
): Promise<SkillCatalogItem | null> {
  let query = supabase
    .from("archive_items")
    .select(SKILL_COLUMNS)
    .eq("category", SKILL_CATEGORY)
    .eq("slug", slug)

  if (!includeDraft) {
    query = query.eq("status", "published")
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error(`Error fetching skill '${slug}':`, error)
    return null
  }

  return (data as SkillCatalogItem | null) ?? null
}

/** 사이트맵·정적 경로 생성용 slug 목록 */
export async function getPublishedSkillSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("slug")
    .eq("category", SKILL_CATEGORY)
    .eq("status", "published")
    .not("slug", "is", null)

  if (error) {
    console.error("Error fetching skill slugs:", error)
    return []
  }

  return (data || []).map((row: { slug: string }) => row.slug)
}

/**
 * 기존 /skills/{id} 링크를 살리기 위한 확인용.
 * 스킬 slug 가 아닌 값이 들어왔을 때 그게 옛 기술 아카이브 id 인지 판정한다.
 */
export async function isLegacyArchiveId(id: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (error) return false
  return Boolean(data)
}
