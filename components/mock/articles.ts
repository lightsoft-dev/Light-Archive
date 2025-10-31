/**
 * Articles 테이블 목데이터
 * Supabase articles 테이블 구조를 참고하여 작성
 */
export type Article = {
  id: string
  title: string
  content: string
  date: string
  category: string
  created_at?: string
  updated_at?: string
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Light Archive 소개",
    content: `Light Archive는 AI 기반 기술과 프로젝트 아카이브 플랫폼입니다. 대화 형식을 통해 Light Archive는 복잡한 기술 지식을 체계적으로 정리하고, 관련 항목을 자동으로 추천하며, 지식 자산을 효율적으로 관리할 수 있도록 도와줍니다.

Light Archive는 Rich Text와 Markdown을 지원하는 에디터로, 기술 문서와 프로젝트 성과를 쉽게 기록하고 관리할 수 있습니다. AI 기반 초안 생성, 요약, 태그 자동 제안 기능을 통해 콘텐츠 작성의 효율성을 높입니다.

외부에는 우리 팀의 기술력과 프로젝트 성과를 홍보하고, 내부에는 지식 자산을 축적하고 재활용하는 공간을 제공합니다. 카테고리별 필터링, 검색 기능, 유사 항목 추천을 통해 원하는 정보를 빠르게 찾을 수 있습니다.`,
    date: "2024년 12월",
    category: "제품",
    created_at: "2024-12-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
  },
]

