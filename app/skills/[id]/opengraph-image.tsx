import { getArchiveById } from "@/lib/supabase-archive"
import { generateArchiveOGImage, OG_SIZE } from "@/lib/og-image"

export const runtime = "nodejs"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const archive = await getArchiveById(id)
  return generateArchiveOGImage(archive)
}
