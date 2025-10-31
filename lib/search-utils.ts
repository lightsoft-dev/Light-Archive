import { Post } from "@/types/archive"

/**
 * 검색어를 기반으로 포스트를 필터링하는 함수
 * @param posts - 검색할 포스트 배열
 * @param query - 검색어
 * @returns 필터링된 포스트 배열
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  // 검색어가 없으면 전체 포스트 반환
  if (!query || query.trim() === "") {
    return posts
  }

  const searchTerm = query.toLowerCase().trim()

  return posts.filter((post) => {
    // 1. 제목 검색 (가중치 높음)
    const titleMatch = post.title?.toLowerCase().includes(searchTerm)

    // 2. 설명 검색
    const descriptionMatch = post.description?.toLowerCase().includes(searchTerm)

    // 3. 카테고리 검색
    const categoryMatch = post.category?.toLowerCase().includes(searchTerm)

    // 4. 태그 검색
    const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))

    // 5. 기술 스택 검색
    const technologiesMatch = post.technologies?.some((tech) =>
      tech.toLowerCase().includes(searchTerm)
    )

    // 6. 본문 검색 (HTML 태그 제거 후 검색)
    const contentMatch = post.content
      ? stripHtmlTags(post.content).toLowerCase().includes(searchTerm)
      : false

    // 하나라도 매칭되면 포함
    return (
      titleMatch ||
      descriptionMatch ||
      categoryMatch ||
      tagsMatch ||
      technologiesMatch ||
      contentMatch
    )
  })
}

/**
 * HTML 태그를 제거하는 함수
 * @param html - HTML 문자열
 * @returns 태그가 제거된 텍스트
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "")
}

/**
 * 검색 결과에 하이라이팅을 추가하는 함수
 * @param text - 원본 텍스트
 * @param query - 검색어
 * @returns 하이라이팅된 텍스트 (HTML)
 */
export function highlightSearchTerm(text: string, query: string): string {
  if (!query || !text) return text

  const regex = new RegExp(`(${query})`, "gi")
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}
