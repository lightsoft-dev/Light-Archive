import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "Light Archive - 기술과 프로젝트의 기록"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: "black",
            }}
          >
            Light Archive
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#666",
            }}
          >
            기술과 프로젝트의 기록
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
