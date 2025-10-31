import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * HTML 컨텐츠에서 첫 번째 이미지 URL을 추출합니다.
 * @param content - HTML 컨텐츠
 * @returns 이미지 URL 또는 null
 */
export function extractFirstImageFromContent(content?: string | null): string | null {
  if (!content) return null

  // img 태그에서 src 추출
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1]
  }

  return null
}

/**
 * 아카이브의 썸네일 이미지를 가져옵니다.
 * 우선순위: 1. image 필드 2. thumbnail_url 3. 컨텐츠의 첫 이미지 4. 기본 이미지
 */
export function getArchiveThumbnail(archive: {
  image?: string | null
  thumbnail_url?: string | null
  content?: string | null
}): string {
  // 1. image 필드 확인
  if (archive.image) return archive.image

  // 2. thumbnail_url 필드 확인
  if (archive.thumbnail_url) return archive.thumbnail_url

  // 3. 컨텐츠에서 첫 번째 이미지 추출
  const contentImage = extractFirstImageFromContent(archive.content)
  if (contentImage) return contentImage

  // 4. 기본 이미지 사용
  return '/normal.jpg'
}
