"use client"

import { useEffect, useState } from "react"
import { ArchiveContent } from "@/components/archive-content"
import { RelatedArchivesSection } from "@/components/related-archives-section"
import { getArchiveById, incrementViewCount } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function ProjectContent({ id }: { id?: string }) {
  const [project, setProject] = useState<Archive | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProject() {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const data = await getArchiveById(id)
        setProject(data)

        // 조회수 증가
        if (data) {
          incrementViewCount(id)
        }
      } catch (error) {
        console.error("Failed to fetch project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>로딩 중...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <p>프로젝트를 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <ArchiveContent
      archive={project}
      relatedSection={<RelatedArchivesSection currentArchive={project} />}
    />
  )
}
