import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "프로젝트",
  description: "Lightsoft 팀의 프로젝트 성과와 결과물. AI 챗봇, 데이터 분석, 웹 애플리케이션 등 다양한 프로젝트 사례를 확인하세요.",
  keywords: [
    "프로젝트",
    "포트폴리오",
    "AI 챗봇",
    "데이터 분석",
    "웹 개발",
    "React 프로젝트",
    "Next.js 프로젝트",
    "사내 시스템",
  ],
  openGraph: {
    title: "프로젝트 | Light Archive",
    description: "Lightsoft 팀의 프로젝트 성과와 결과물",
    url: "/projects",
    type: "website",
  },
  twitter: {
    title: "프로젝트 | Light Archive",
    description: "Lightsoft 팀의 프로젝트 성과와 결과물",
  },
  alternates: {
    canonical: "/projects",
  },
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
