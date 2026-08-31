import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "스킬",
  description:
    "Lightsoft 팀이 만든 에이전트 스킬 카탈로그. Claude Code·Codex에서 바로 설치해 쓰는 반복 작업 자동화 스킬을 모았습니다.",
  keywords: [
    "에이전트 스킬",
    "agent skills",
    "Claude Code",
    "Codex",
    "skills.sh",
    "npx skills add",
    "개발 자동화",
    "AI 에이전트",
  ],
  openGraph: {
    title: "스킬 | Light Archive",
    description: "Claude Code·Codex에서 바로 설치해 쓰는 에이전트 스킬 카탈로그",
    url: "/skills",
    type: "website",
  },
  twitter: {
    title: "스킬 | Light Archive",
    description: "Claude Code·Codex에서 바로 설치해 쓰는 에이전트 스킬 카탈로그",
  },
  alternates: {
    canonical: "/skills",
  },
}

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children
}
