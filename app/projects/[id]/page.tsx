import type { Metadata } from "next"
import { ArchiveLayout } from "@/components/layouts/archive-layout"
import { ProjectContent } from "@/components/project-content"
import { getArchiveById } from "@/lib/supabase-archive"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const archive = await getArchiveById(id)

  if (!archive) {
    return {
      title: "프로젝트 | Light Archive",
      description: "Lightsoft 팀의 프로젝트 아카이브",
    }
  }

  const title = `${archive.title} | Light Archive`
  const description = archive.description || archive.excerpt || "Lightsoft 팀의 프로젝트 아카이브"
  const imageUrl = archive.thumbnail_url || archive.image

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/projects/${id}`,
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

export default async function ProjectPage({ params }: Props) {
  const { id } = await params

  return (
    <ArchiveLayout archiveId={id}>
      <ProjectContent id={id} />
    </ArchiveLayout>
  )
}
