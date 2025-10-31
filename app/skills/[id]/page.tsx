"use client"

import { ArchiveLayout } from "@/components/layouts/archive-layout"
import { SkillContent } from "@/components/skill-content"
import { useParams } from "next/navigation"

export default function SkillPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <ArchiveLayout>
      <SkillContent id={id} />
    </ArchiveLayout>
  )
}
