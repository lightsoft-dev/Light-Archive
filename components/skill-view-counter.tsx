"use client"

import { useEffect } from "react"
import { incrementViewCount } from "@/lib/supabase-archive"

/** 상세 진입 시 조회수 1 증가. 서버 렌더를 막지 않으려고 클라이언트에서 처리한다 */
export function SkillViewCounter({ archiveId }: { archiveId: string }) {
  useEffect(() => {
    incrementViewCount(archiveId)
  }, [archiveId])

  return null
}
