/**
 * 공통 Archive 타입
 * Projects, Skills, Posts 모두 이 타입을 확장하여 사용
 */

export type ArchiveStatus = "draft" | "published" | "archived"
export type ArchiveDifficulty = "beginner" | "intermediate" | "advanced" | "초급" | "중급" | "고급"

export interface BaseArchive {
  id: string
  title: string
  description?: string // Optional로 변경
  category: string
  sub_category?: string // DB 필드명과 일치
  status?: ArchiveStatus

  // 메타데이터
  date?: string
  tags?: string[]
  technologies?: string[]
  difficulty?: string | ArchiveDifficulty
  field?: string
  author?: string

  // 미디어
  image?: string
  thumbnail_url?: string

  // 통계
  view_count?: number // DB 필드명과 일치
  comment_count?: number // DB 필드명과 일치

  // 컨텐츠
  content?: string // Rich text HTML content
  excerpt?: string // 요약문

  // 타임스탬프
  created_at?: string
  updated_at?: string
  published_at?: string
}

/**
 * Project 타입
 * 프로젝트 아카이브 전용
 */
export interface Project extends BaseArchive {
  category: "프로젝트"
  description: string // 프로젝트는 설명 필수
  image: string // 프로젝트는 이미지 필수
}

/**
 * Skill 타입
 * 기술/스킬 아카이브 전용
 */
export interface Skill extends BaseArchive {
  category: "기술"
  description: string // 스킬은 설명 필수
  sub_category?: "클로드 코드" | "인공지능 활용" | string
}

/**
 * Post 타입
 * 일반 포스트/뉴스 아카이브
 */
export interface Post extends BaseArchive {
  // Post는 category가 자유로움
}

/**
 * Archive 타입 (통합)
 * Projects, Skills, Posts의 유니온 타입
 */
export type Archive = Project | Skill | Post

/**
 * 카테고리 타입
 */
export type ArchiveCategory = "기술" | "프로젝트" | "리서치" | "뉴스"

// Re-export for convenience
export type { Project, Skill, Post }
