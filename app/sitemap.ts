import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://light-archive.vercel.app"

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // TODO: 동적 페이지는 Supabase에서 데이터를 가져와서 생성
  // 현재는 정적 페이지만 포함
  // 나중에 다음과 같이 추가:
  // const projects = await getProjects()
  // const projectPages = projects.map((project) => ({
  //   url: `${baseUrl}/projects/${project.id}`,
  //   lastModified: new Date(project.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }))

  return [...staticPages]
}
