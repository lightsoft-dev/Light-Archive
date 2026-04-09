import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { BaseArchive } from "@/types/archive"

export const OG_SIZE = { width: 1200, height: 630 }

// 로고 이미지를 base64로 로드
async function loadLogo(): Promise<string | null> {
  try {
    const data = await readFile(join(process.cwd(), "public/가로logo.png"), "base64")
    return `data:image/png;base64,${data}`
  } catch {
    return null
  }
}

// @fontsource/noto-sans-kr 패키지에서 로컬 woff 파일 로드 (한글 + 라틴)
async function loadKoreanFont(): Promise<{ korean: ArrayBuffer; latin: ArrayBuffer } | null> {
  try {
    const [korean, latin] = await Promise.all([
      readFile(join(process.cwd(), "node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff")),
      readFile(join(process.cwd(), "node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-latin-700-normal.woff")),
    ])
    return {
      korean: korean.buffer as ArrayBuffer,
      latin: latin.buffer as ArrayBuffer,
    }
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
  const [fonts, logoSrc] = await Promise.all([loadKoreanFont(), loadLogo()])

  const options: ConstructorParameters<typeof ImageResponse>[1] = {
    ...OG_SIZE,
    ...(fonts && {
      fonts: [
        { name: "NotoSansKR", data: fonts.korean, weight: 700, style: "normal" },
        { name: "NotoSansKR", data: fonts.latin, weight: 700, style: "normal" },
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
          flexDirection: "column",
          backgroundColor: "#fff",
          fontFamily: fonts ? "NotoSansKR" : "sans-serif",
          padding: "64px",
        }}
      >
        {/* 상단: 로고 */}
        <div style={{ display: "flex", marginBottom: "auto" }}>
          {logoSrc && (
            <img src={logoSrc} style={{ height: 36 }} />
          )}
        </div>

        {/* 중앙: 본문 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          {/* 카테고리 배지 */}
          {category && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                backgroundColor: "#000",
                color: "#fff",
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
              fontSize: 60,
              fontWeight: "bold",
              color: "#000",
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
                color: "#666",
                lineHeight: 1.5,
                display: "flex",
              }}
            >
              {description.length > 80 ? description.slice(0, 80) + "…" : description}
            </div>
          )}
        </div>

        {/* 하단: 구분선 + URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", height: 1, backgroundColor: "#e5e5e5" }} />
          <div style={{ display: "flex", fontSize: 20, color: "#999" }}>
            archive.lightsoft.dev
          </div>
        </div>
      </div>
    ),
    options
  )
}
