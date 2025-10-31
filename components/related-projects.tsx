"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { getRecentArchives } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function RelatedProjects() {
  const [isVisible, setIsVisible] = useState(true)
  const [projects, setProjects] = useState<Archive[]>([])

  useEffect(() => {
    async function fetchProjects() {
      try {
        // 최근 프로젝트 4개 가져오기
        const data = await getRecentArchives(4)
        // 프로젝트 카테고리만 필터링
        const filtered = data.filter(item => item.category === "프로젝트")
        setProjects(filtered)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      }
    }
    fetchProjects()
  }, [])

  if (!isVisible || projects.length === 0) return null

  return (
    <aside className="fixed bottom-6 right-6 w-72 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg z-30 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">유사 프로젝트</h3>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-gray-100/50 rounded-md transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src={project.image || project.thumbnail_url || `https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=640&h=360&fit=crop`}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                  {project.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description || ""}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
