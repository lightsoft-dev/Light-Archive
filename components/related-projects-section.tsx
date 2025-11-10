"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getRecentArchives } from "@/lib/supabase-archive"
import { getArchiveThumbnail } from "@/lib/utils"
import type { Archive } from "@/types/archive"

export function RelatedProjectsSection() {
  const [projects, setProjects] = useState<Archive[]>([])

  useEffect(() => {
    async function fetchProjects() {
      try {
        // 최근 아카이브 4개 가져오기
        const data = await getRecentArchives(4)
        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }
    fetchProjects()
  }, [])

  if (projects.length === 0) return null

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl md:text-3xl font-normal text-black mb-6">관련 아카이브</h2>
      
      <div className="space-y-0">
        {projects.map((project, index) => (
          <div key={project.id}>
            <Link
              href={`/${project.category === "프로젝트" ? "projects" : "skills"}/${project.id}`}
              className="group block py-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img
                    src={getArchiveThumbnail(project)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{project.category}</div>
                  <h3 className="text-base font-medium text-black mb-1 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description || ""}</p>
                </div>
              </div>
            </Link>
            {index < projects.length - 1 && (
              <div className="border-b border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

