"use client"

import Link from "next/link"
import { mockSkills } from "@/components/mock/skills"

export function RelatedSkillsSection({ currentSkillId }: { currentSkillId?: string }) {
  // 현재 스킬을 제외하고 같은 카테고리에서 최대 4개 선택
  const currentSkill = mockSkills.find((s) => s.id === currentSkillId)
  const relatedSkills = mockSkills
    .filter((skill) => {
      if (skill.id === currentSkillId) return false
      if (currentSkill?.subCategory) {
        return skill.subCategory === currentSkill.subCategory
      }
      return skill.category === currentSkill?.category
    })
    .slice(0, 4)

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
                {skill.image && (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={skill.image}
                      alt={skill.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{skill.subCategory || skill.category}</div>
                  <h3 className="text-base font-medium text-black mb-1 group-hover:text-gray-600 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{skill.description}</p>
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

