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
export async function createArchive(archive: Omit<Archive, "id" | "created_at" | "updated_at">): Promise<Archive | null> {
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
 * 관련 아카이브 가져오기 (같은 태그 기반)
 */
export async function getRelatedArchives(
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
