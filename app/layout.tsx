import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Light Archive - 기술과 프로젝트의 기록",
    template: "%s | Light Archive",
  },
  description: "Lightsoft의 기술 문서와 프로젝트 아카이브. AI, 웹 개발, 사내 시스템 등 다양한 기술 경험과 인사이트를 공유합니다.",
  keywords: [
    "기술 블로그",
    "프로젝트 아카이브",
    "웹 개발",
    "AI",
    "인공지능",
    "React",
    "Next.js",
    "TypeScript",
    "Lightsoft",
    "클로드 코드",
    "사내 시스템",
    "개발 문서",
  ],
  authors: [{ name: "Lightsoft Team" }],
  creator: "Lightsoft",
  publisher: "Lightsoft",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://light-archive.vercel.app",
    siteName: "Light Archive",
    title: "Light Archive - 기술과 프로젝트의 기록",
    description: "Lightsoft의 기술 문서와 프로젝트 아카이브. AI, 웹 개발, 사내 시스템 등 다양한 기술 경험과 인사이트를 공유합니다.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Light Archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Light Archive - 기술과 프로젝트의 기록",
    description: "Lightsoft의 기술 문서와 프로젝트 아카이브",
    images: ["/og-image.jpg"],
    creator: "@lightsoft",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://light-archive.vercel.app"),
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <StructuredData type="website" />
        <StructuredData type="organization" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
