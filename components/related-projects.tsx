"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useState } from "react"
import { mockProjects } from "@/components/mock/projects"

export function RelatedProjects() {
  const [isVisible, setIsVisible] = useState(true)
  
  // 최대 4개까지만 표시
  const displayedProjects = mockProjects.slice(0, 4)

  if (!isVisible) return null

  return (
    <aside className="fixed bottom-6 right-6 w-72 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg z-30 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">유사 프로젝트</h3>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-gray-100/50 rounded-md transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {displayedProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                  {project.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
