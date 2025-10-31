import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "기술",
  description: "Lightsoft 팀의 기술 문서와 가이드. 클로드 코드, AI 활용, React, Next.js 등 실무에서 사용하는 기술 스택과 노하우를 공유합니다.",
  keywords: [
    "기술 문서",
    "개발 가이드",
    "클로드 코드",
    "Claude Code",
    "AI 활용",
    "React 튜토리얼",
    "Next.js 가이드",
    "TypeScript",
    "개발 팁",
  ],
  openGraph: {
    title: "기술 | Light Archive",
    description: "Lightsoft 팀의 기술 문서와 가이드",
    url: "/skills",
    type: "website",
  },
  twitter: {
    title: "기술 | Light Archive",
    description: "Lightsoft 팀의 기술 문서와 가이드",
  },
  alternates: {
    canonical: "/skills",
  },
}

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
