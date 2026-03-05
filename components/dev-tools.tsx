"use client"

import dynamic from "next/dynamic"

const Agentation = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
)

/**
 * 개발 환경에서만 Agentation 도구를 렌더링
 * 프로덕션 빌드에서는 완전히 제외됨
 */
export function DevTools() {
  if (process.env.NODE_ENV !== "development") return null
  return <Agentation />
}
