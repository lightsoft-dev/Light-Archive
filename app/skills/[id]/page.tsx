import type { Metadata } from "next"
import { ArchiveLayout } from "@/components/layouts/archive-layout"
import { SkillContent } from "@/components/skill-content"
import { getArchiveById } from "@/lib/supabase-archive"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const archive = await getArchiveById(id)

  if (!archive) {
    return {
      title: "기술 | Light Archive",
      description: "Lightsoft 팀의 기술 문서와 가이드",
    }
  }

  const title = `${archive.title} | Light Archive`
  const description = archive.description || archive.excerpt || "Lightsoft 팀의 기술 문서와 가이드"
  const imageUrl = archive.thumbnail_url || archive.image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/skills/${id}`,
      type: "article",
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  }
}

export default async function SkillPage({ params }: Props) {
  const { id } = await params

  return (
    <ArchiveLayout archiveId={id}>
      <SkillContent id={id} />
    </ArchiveLayout>
  )
}
