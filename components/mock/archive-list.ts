/**
 * Archive List 목데이터
 * Supabase archive_list 테이블 구조를 참고하여 작성
 */
export type ArchiveItem = {
  id: number | string
  date: string
  category: string
  title: string
  excerpt: string
  readTime: string
  created_at?: string
  updated_at?: string
}

export const mockArchiveList: ArchiveItem[] = [
  {
    id: 1,
    date: "2024년 10월 30일",
    category: "개발",
    title: "Next.js 15의 새로운 기능들",
    excerpt:
      "Next.js 15에서 추가된 주요 기능들과 성능 개선 사항을 살펴봅니다. React 19 지원과 함께 더욱 강력해진 프레임워크의 변화를 알아보세요.",
    readTime: "5분",
    created_at: "2024-10-30T00:00:00Z",
    updated_at: "2024-10-30T00:00:00Z",
  },
  {
    id: 2,
    date: "2024년 10월 28일",
    category: "디자인",
    title: "미니멀 디자인의 힘",
    excerpt:
      "적은 것이 더 많은 것이다. 미니멀 디자인 철학이 사용자 경험에 미치는 영향과 실제 적용 사례를 통해 그 가치를 탐구합니다.",
    readTime: "7분",
    created_at: "2024-10-28T00:00:00Z",
    updated_at: "2024-10-28T00:00:00Z",
  },
  {
    id: 3,
    date: "2024년 10월 25일",
    category: "생각",
    title: "좋은 코드란 무엇인가",
    excerpt:
      "읽기 쉽고 유지보수가 용이한 코드를 작성하기 위한 원칙들. 실무에서 배운 교훈과 함께 좋은 코드의 기준에 대해 이야기합니다.",
    readTime: "6분",
    created_at: "2024-10-25T00:00:00Z",
    updated_at: "2024-10-25T00:00:00Z",
  },
  {
    id: 4,
    date: "2024년 10월 22일",
    category: "개발",
    title: "TypeScript 타입 시스템 깊이 이해하기",
    excerpt: "TypeScript의 강력한 타입 시스템을 활용하여 더 안전하고 예측 가능한 코드를 작성하는 방법을 알아봅니다.",
    readTime: "8분",
    created_at: "2024-10-22T00:00:00Z",
    updated_at: "2024-10-22T00:00:00Z",
  },
  {
    id: 5,
    date: "2024년 10월 20일",
    category: "일상",
    title: "개발자의 일상과 루틴",
    excerpt:
      "효율적인 개발 루틴을 만들기 위한 나만의 방법. 생산성을 높이고 번아웃을 방지하는 일상의 작은 습관들을 공유합니다.",
    readTime: "4분",
    created_at: "2024-10-20T00:00:00Z",
    updated_at: "2024-10-20T00:00:00Z",
  },
  {
    id: 6,
    date: "2024년 10월 18일",
    category: "개발",
    title: "React Server Components 실전 가이드",
    excerpt:
      "React Server Components의 개념부터 실제 프로젝트 적용까지. 성능 최적화와 사용자 경험 개선을 위한 실용적인 접근법을 다룹니다.",
    readTime: "10분",
    created_at: "2024-10-18T00:00:00Z",
    updated_at: "2024-10-18T00:00:00Z",
  },
]

