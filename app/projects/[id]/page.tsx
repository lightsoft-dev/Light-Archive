"use client"

import { ArchiveLayout } from "@/components/layouts/archive-layout"
import { ProjectContent } from "@/components/project-content"
import { useParams } from "next/navigation"

export default function ProjectPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <ArchiveLayout archiveId={id}>
      <ProjectContent id={id} />
    </ArchiveLayout>
  )
}
