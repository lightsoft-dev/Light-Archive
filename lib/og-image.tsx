import { ImageResponse } from "next/og"
import type { BaseArchive } from "@/types/archive"

export const OG_SIZE = { width: 1200, height: 630 }

// Google Fonts에서 한글 지원 폰트(Noto Sans KR) 로드
// 구형 UA를 사용하면 woff2 대신 ttf URL을 반환함
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)" } }
    ).then((r) => r.text())

    // TTF URL 추출
    const match = css.match(/src: url\(([^)]+)\)/)
    if (!match) return null

    return fetch(match[1]).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

type ArchiveForOG = Pick<
  BaseArchive,
  "title" | "description" | "excerpt" | "category" | "thumbnail_url" | "image"
>

export async function generateArchiveOGImage(archive: ArchiveForOG | null) {
  const title = archive?.title ?? "Light Archive"
  const description = archive?.description ?? archive?.excerpt ?? ""
  const category = archive?.category ?? ""
  const thumbnailUrl = archive?.thumbnail_url ?? archive?.image ?? null

  // 실제 사용할 텍스트만 subset으로 로드 (폰트 크기 최소화)
  const fontData = await loadKoreanFont(title + description + category + "Light Archive")

  const options: ConstructorParameters<typeof ImageResponse>[1] = {
    ...OG_SIZE,
    ...(fontData && {
      fonts: [
        {
          name: "NotoSansKR",
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    }),
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#000",
          fontFamily: fontData ? "NotoSansKR" : "sans-serif",
        }}
      >
        {/* 썸네일 배경 이미지 (있을 때) */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        )}

        {/* 하단 그라디언트 오버레이 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "75%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* 썸네일 없을 때 오른쪽 'LA' 장식 */}
        {!thumbnailUrl && (
          <div
            style={{
              position: "absolute",
              right: "60px",
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 240,
                fontWeight: "bold",
                color: "white",
                opacity: 0.05,
                letterSpacing: "-10px",
                display: "flex",
              }}
            >
              LA
            </div>
          </div>
        )}

        {/* 콘텐츠 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "56px 64px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* 카테고리 배지 */}
          {category && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
                padding: "6px 18px",
                borderRadius: "999px",
                fontSize: 18,
              }}
            >
              {category}
            </div>
          )}

          {/* 제목 */}
          <div
            style={{
              fontSize: 58,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.2,
              display: "flex",
            }}
          >
            {title.length > 38 ? title.slice(0, 38) + "…" : title}
          </div>

          {/* 설명 */}
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.5,
                display: "flex",
              }}
            >
              {description.length > 75 ? description.slice(0, 75) + "…" : description}
            </div>
          )}

          {/* 브랜딩 */}
          <div
            style={{
              display: "flex",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.08em",
                display: "flex",
              }}
            >
              archive.lightsoft.dev
            </div>
          </div>
        </div>
      </div>
    ),
    options
  )
}
