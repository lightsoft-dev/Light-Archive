"use client"

import { useEffect, useState } from "react"
import { ArchiveContent } from "@/components/archive-content"
import { RelatedArchivesSection } from "@/components/related-archives-section"
import { getArchiveById, incrementViewCount } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function SkillContent({ id }: { id?: string }) {
  const [skill, setSkill] = useState<Archive | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSkill() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const data = await getArchiveById(id)
        setSkill(data)

        // 조회수 증가
        if (data) {
          incrementViewCount(id)
        }
      } catch (error) {
        console.error("Failed to fetch skill:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSkill()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>스킬을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <ArchiveContent
      archive={skill}
      relatedSection={<RelatedArchivesSection currentArchive={skill} />}
    />
  )
}
