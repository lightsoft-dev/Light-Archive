/**
 * Supabase Archive 데이터 접근 함수들
 * archive_items 테이블과 상호작용하는 함수들
 */

import { supabase } from "./supabase"
import type { Archive } from "@/types/archive"

/**
 * 모든 아카이브 가져오기
 */
export async function getAllArchives(): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching archives:", error)
    return []
  }

  return data || []
}

/**
 * 카테고리별 아카이브 가져오기
 */
export async function getArchivesByCategory(category: string): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching archives for category ${category}:`, error)
    return []
  }

  return data || []
}

/**
 * 특정 아카이브 가져오기 (ID로)
 */
export async function getArchiveById(id: string): Promise<Archive | null> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching archive ${id}:`, error)
    return null
  }

  return data
}

/**
 * 프로젝트만 가져오기
 */
export async function getProjects(): Promise<Archive[]> {
  return getArchivesByCategory("프로젝트")
}

/**
 * 스킬만 가져오기
 */
export async function getSkills(): Promise<Archive[]> {
  return getArchivesByCategory("기술")
}

/**
 * 서브카테고리별 아카이브 가져오기
 */
export async function getArchivesBySubCategory(
  category: string,
  subCategory: string
): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .eq("category", category)
    .eq("sub_category", subCategory)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching archives for ${category}/${subCategory}:`, error)
    return []
  }

  return data || []
}

/**
 * 태그로 아카이브 검색
 */
export async function getArchivesByTag(tag: string): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .contains("tags", [tag])
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching archives with tag ${tag}:`, error)
    return []
  }

  return data || []
}

/**
 * 전체 텍스트 검색
 */
export async function searchArchives(query: string): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error searching archives with query "${query}":`, error)
    return []
  }

  return data || []
}

/**
 * 아카이브 생성
 */
export async function createArchive(archive: Omit<Archive, "created_at" | "updated_at">): Promise<Archive | null> {
  const { data, error } = await supabase
    .from("archive_items")
    .insert([archive])
    .select()
    .single()

  if (error) {
    console.error("Error creating archive:", error)
    return null
  }

  return data
}

/**
 * 아카이브 수정
 */
export async function updateArchive(id: string, updates: Partial<Archive>): Promise<Archive | null> {
  const { data, error } = await supabase
    .from("archive_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating archive ${id}:`, error)
    return null
  }

  return data
}

/**
 * 아카이브 삭제
 */
export async function deleteArchive(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("archive_items")
    .delete()
    .eq("id", id)

  if (error) {
    console.error(`Error deleting archive ${id}:`, error)
    return false
  }

  return true
}

/**
 * 조회수 증가
 */
export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_archive_view_count", {
    archive_id: id,
  })

  if (error) {
    console.error(`Error incrementing view count for archive ${id}:`, error)
  }
}

/**
 * 인기 아카이브 가져오기 (조회수 기준)
 */
export async function getPopularArchives(limit: number = 5): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching popular archives:", error)
    return []
  }

  return data || []
}

/**
 * 최신 아카이브 가져오기
 */
export async function getRecentArchives(limit: number = 5): Promise<Archive[]> {
  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent archives:", error)
    return []
  }

  return data || []
}

/**
 * 관련 아카이브 가져오기 (스마트 추천)
 *
 * 추천 우선순위:
 * 1. 같은 카테고리
 * 2. 태그가 2개 이상 겹침 (높은 관련성)
 * 3. 태그가 1개 이상 겹침 (보통 관련성)
 * 4. 같은 기술 스택 사용
 * 5. 최신순
 */
export async function getRelatedArchives(
  currentArchive: Archive,
  limit: number = 5
): Promise<Archive[]> {
  try {
    // 1. 같은 카테고리 + 태그 겹침이 있는 아카이브 찾기
    const tags = currentArchive.tags || []
    const technologies = currentArchive.technologies || []

    if (tags.length === 0 && technologies.length === 0) {
      // 태그와 기술이 없으면 같은 카테고리의 최신 아카이브 반환
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .eq("category", currentArchive.category)
        .neq("id", currentArchive.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    }

    // 2. 태그 또는 기술 스택이 겹치는 아카이브 찾기
    const { data: allCandidates, error } = await supabase
      .from("archive_items")
      .select("*")
      .neq("id", currentArchive.id)
      .order("created_at", { ascending: false })
      .limit(50) // 충분한 후보군 확보

    if (error) throw error
    if (!allCandidates || allCandidates.length === 0) return []

    // 3. 관련성 점수 계산
    const scoredArchives = allCandidates.map((archive) => {
      let score = 0

      // 같은 카테고리: +10점
      if (archive.category === currentArchive.category) {
        score += 10
      }

      // 태그 겹침 계산
      const archiveTags = archive.tags || []
      const commonTags = tags.filter((tag) => archiveTags.includes(tag))
      score += commonTags.length * 5 // 태그 하나당 +5점

      // 기술 스택 겹침 계산
      const archiveTech = archive.technologies || []
      const commonTech = technologies.filter((tech) => archiveTech.includes(tech))
      score += commonTech.length * 3 // 기술 하나당 +3점

      // 조회수 보너스 (인기있는 글)
      if (archive.view_count && archive.view_count > 100) {
        score += 2
      }

      return { archive, score }
    })

    // 4. 점수순으로 정렬하고 상위 N개 반환
    const topRelated = scoredArchives
      .filter((item) => item.score > 0) // 관련성이 있는 것만
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.archive)

    return topRelated
  } catch (error) {
    console.error("Error fetching related archives:", error)
    return []
  }
}

/**
 * 태그 기반 관련 아카이브 가져오기 (레거시 - 하위 호환성)
 * @deprecated getRelatedArchives(currentArchive, limit) 사용 권장
 */
export async function getRelatedArchivesByTags(
  currentId: string,
  tags: string[],
  limit: number = 3
): Promise<Archive[]> {
  if (tags.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from("archive_items")
    .select("*")
    .neq("id", currentId)
    .overlaps("tags", tags)
    .limit(limit)

  if (error) {
    console.error("Error fetching related archives:", error)
    return []
  }

  return data || []
}
