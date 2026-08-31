/**
 * 에이전트 스킬 카탈로그 조회 — **서버 전용**
 *
 * 왜 서버 전용인가 — 사내 전용 스킬(`skill_meta.visibility = "internal"`)은 RLS 에서
 * anon 에게 아예 안 보이게 막혀 있다. 그래서 브라우저에서 Supabase 를 직접 부르면
 * 사내 스킬이 없는 것처럼 보인다. 조회는 서버(service_role)를 거치고,
 * 화면에 내보낼지는 관리자 세션 여부로 서버가 정한다.
 *
 * 저장소는 archive_items 이며 category = '스킬' 인 행만 다룬다.
 */
import { getWriteClient } from "./supabase-server"
import { SKILL_CATEGORY, type SkillCatalogItem } from "@/types/skill"

const SKILL_COLUMNS =
  "id, slug, title, description, status, author, tags, sections, skill_meta, view_count, comment_count, thumbnail_url, created_at, updated_at, published_at"

/** 사내 전용인지 — skill_meta 가 없으면 공개로 본다 */
function isInternal(skill: SkillCatalogItem): boolean {
  return (skill.skill_meta?.visibility ?? "public") === "internal"
}

/**
 * 공개된 스킬 목록 (최신순)
 *
 * includeInternal 은 호출부가 관리자 세션을 확인한 뒤에만 true 로 넘긴다.
 * 기본값이 false 인 이유 — 실수로 빠뜨렸을 때 더 많이 보이는 쪽이 아니라
 * 덜 보이는 쪽으로 실패해야 한다.
 */
export async function getSkillCatalog(includeInternal = false): Promise<SkillCatalogItem[]> {
  const { data, error } = await getWriteClient()
    .from("archive_items")
    .select(SKILL_COLUMNS)
    .eq("category", SKILL_CATEGORY)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching skill catalog:", error)
    return []
  }

  const skills = (data as SkillCatalogItem[]) || []
  return includeInternal ? skills : skills.filter((s) => !isInternal(s))
}

/**
 * slug 로 스킬 하나 조회
 *
 * includeDraft 는 미리보기 전용, includeInternal 은 사내 전용 열람 전용이다.
 * 둘 다 호출부(서버 컴포넌트/라우트)가 자격을 확인한 뒤에만 켠다 —
 * 클라이언트에서 임의로 켤 수 없어야 한다.
 */
export async function getSkillBySlug(
  slug: string,
  options: { includeDraft?: boolean; includeInternal?: boolean } = {}
): Promise<SkillCatalogItem | null> {
  let query = getWriteClient()
    .from("archive_items")
    .select(SKILL_COLUMNS)
    .eq("category", SKILL_CATEGORY)
    .eq("slug", slug)

  if (!options.includeDraft) {
    query = query.eq("status", "published")
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error(`Error fetching skill '${slug}':`, error)
    return null
  }

  const skill = (data as SkillCatalogItem | null) ?? null
  if (!skill) return null

  // 사내 전용은 자격이 없으면 "없는 것"으로 응답한다.
  // 403 을 주면 그 이름의 스킬이 존재한다는 사실 자체가 새어 나간다.
  if (isInternal(skill) && !options.includeInternal) return null

  return skill
}

/** 사이트맵용 — 공개 스킬만 */
export async function getPublishedSkillSlugs(): Promise<string[]> {
  const skills = await getSkillCatalog(false)
  return skills.map((s) => s.slug).filter(Boolean)
}

/**
 * 기존 /skills/{id} 링크를 살리기 위한 확인용.
 * 스킬 slug 가 아닌 값이 들어왔을 때 그게 옛 기술 아카이브 id 인지 판정한다.
 */
export async function isLegacyArchiveId(id: string): Promise<boolean> {
  const { data, error } = await getWriteClient()
    .from("archive_items")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (error) return false
  return Boolean(data)
}
