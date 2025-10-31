/**
 * 구조화된 데이터 (JSON-LD) 컴포넌트
 * SEO를 위한 Schema.org 마크업
 */

interface StructuredDataProps {
  type: "website" | "article" | "organization"
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "website":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Light Archive",
          url: "https://light-archive.vercel.app",
          description: "Lightsoft의 기술 문서와 프로젝트 아카이브",
          publisher: {
            "@type": "Organization",
            name: "Lightsoft",
            logo: {
              "@type": "ImageObject",
              url: "https://light-archive.vercel.app/logo.png",
            },
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://light-archive.vercel.app/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }

      case "organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Lightsoft",
          url: "https://light-archive.vercel.app",
          logo: "https://light-archive.vercel.app/logo.png",
          description: "기술과 프로젝트를 기록하고 공유하는 개발 팀",
          sameAs: [
            // 소셜 미디어 링크 추가 가능
          ],
        }

      case "article":
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data?.title || "",
          description: data?.description || "",
          image: data?.image || "",
          datePublished: data?.publishedAt || new Date().toISOString(),
          dateModified: data?.updatedAt || new Date().toISOString(),
          author: {
            "@type": "Organization",
            name: "Lightsoft",
          },
          publisher: {
            "@type": "Organization",
            name: "Lightsoft",
            logo: {
              "@type": "ImageObject",
              url: "https://light-archive.vercel.app/logo.png",
            },
          },
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
