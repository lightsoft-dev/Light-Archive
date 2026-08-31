import { cookies } from "next/headers"
import { generateArchiveOGImage, OG_SIZE } from "@/lib/og-image"
import { getSkillBySlug } from "@/lib/supabase-skills"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-session"

export const runtime = "nodejs"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 사내 전용 스킬은 OG 이미지로도 내용이 새면 안 된다.
  // 링크를 슬랙에 붙이는 것만으로 제목·설명이 노출되기 때문이다.
  const cookieStore = await cookies()
  const isLoggedIn = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value)

  const skill = await getSkillBySlug(slug, { includeInternal: isLoggedIn })
  if (!skill) return generateArchiveOGImage(null)

  const meta = skill.skill_meta
  const install = meta?.visibility === "internal" ? undefined : meta?.install

  return generateArchiveOGImage(
    {
      title: skill.title,
      description: skill.description,
      category: "스킬",
      thumbnail_url: skill.thumbnail_url,
      image: undefined,
      excerpt: undefined,
    },
    { installCommand: install }
  )
}
