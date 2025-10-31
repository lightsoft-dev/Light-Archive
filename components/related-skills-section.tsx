"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getArchiveById, getRelatedArchives } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export function RelatedSkillsSection({ currentSkillId }: { currentSkillId?: string }) {
  const [relatedSkills, setRelatedSkills] = useState<Archive[]>([])

  useEffect(() => {
    async function fetchRelatedSkills() {
      if (!currentSkillId) return

      try {
        // 현재 스킬 정보 가져오기
        const currentSkill = await getArchiveById(currentSkillId)
        if (!currentSkill) return

        // 관련 스킬 가져오기 (스마트 추천)
        const related = await getRelatedArchives(currentSkill, 4)
        setRelatedSkills(related)
      } catch (error) {
        console.error("Failed to fetch related skills:", error)
      }
    }

    fetchRelatedSkills()
  }, [currentSkillId])

  if (relatedSkills.length === 0) return null

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl md:text-3xl font-normal text-black mb-6">관련 기술</h2>
      
      <div className="space-y-0">
        {relatedSkills.map((skill, index) => (
          <div key={skill.id}>
            <Link
              href={`/skills/${skill.id}`}
              className="group block py-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-3">
                {(skill.image || skill.thumbnail_url) && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={skill.image || skill.thumbnail_url || `https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=640&h=360&fit=crop`}
                      alt={skill.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{skill.sub_category || skill.category}</div>
                  <h3 className="text-base font-medium text-black mb-1 group-hover:text-gray-600 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{skill.description || ""}</p>
                </div>
              </div>
            </Link>
            {index < relatedSkills.length - 1 && (
              <div className="border-b border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

