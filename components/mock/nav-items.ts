/**
 * Navigation Items 목데이터
 * Supabase nav_items 테이블 구조를 참고하여 작성
 * 기획서 v1.0 기준: 기술, 프로젝트, 리서치, 뉴스 카테고리
 */
export type NavItem = {
  id: string
  label: string
  href?: string
  category?: string
  icon?: string
  order?: number
  children?: NavItem[] // 하위 메뉴 지원
}

export type NavSection = {
  title: string
  items: NavItem[]
}

export const mockNavItems: NavSection[] = [
  {
    title: "",
    items: [
      {
        id: "home",
        label: "홈",
        href: "/",
        category: "전체",
        order: 0,
      },
      {
        id: "technology",
        label: "기술",
        category: "기술",
        order: 1,
        children: [
          {
            id: "tech-all",
            label: "전체보기",
            href: "/tech",
            category: "기술",
            order: 1,
          },
          {
            id: "tech-cloud-code",
            label: "클로드 코드",
            href: "/tech?category=cloud-code",
            category: "기술",
            order: 2,
          },
          {
            id: "tech-ai",
            label: "인공지능 활용",
            href: "/tech?category=ai",
            category: "기술",
            order: 3,
          },
        ],
      },
      {
        id: "project",
        label: "프로젝트",
        category: "프로젝트",
        order: 2,
        children: [
          {
            id: "project-all",
            label: "전체보기",
            href: "/projects",
            category: "프로젝트",
            order: 1,
          },
          {
            id: "project-web",
            label: "Web",
            href: "/projects?category=web",
            category: "프로젝트",
            order: 2,
          },
          {
            id: "project-internal",
            label: "사내 시스템",
            href: "/projects?category=internal",
            category: "프로젝트",
            order: 3,
          },
          {
            id: "project-ai",
            label: "AI",
            href: "/projects?category=ai",
            category: "프로젝트",
            order: 4,
          },
        ],
      },
      {
        // 기술·프로젝트의 하위는 "클로드 코드"처럼 주제인데, 스킬의 공개/사내 전용은
        // 접근 범위라 결이 다르다. 사이드바에 섞으면 카테고리처럼 보인다.
        // 범위 필터는 목록 페이지 상단에 두고, 사내 전용은 로그인한 사람에게만 보인다.
        id: "skill",
        label: "스킬",
        href: "/skills",
        category: "스킬",
        order: 3,
      },
    ],
  },
]

