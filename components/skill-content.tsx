"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RelatedSkillsSection } from "@/components/related-skills-section"
import { mockSkills } from "@/components/mock/skills"

export function SkillContent({ id }: { id?: string }) {
  // URL 파라미터에서 id를 받거나 기본값 사용
  const skillId = id || "1"
  const skill = mockSkills.find((s) => s.id === skillId)
  
  if (!skill) {
    console.warn(`Skill with id "${skillId}" not found. Available ids:`, mockSkills.map(s => s.id))
  }
  
  const displaySkill = skill || mockSkills[0]

  return (
    <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Date */}
      <div className="text-sm text-gray-500 mb-6">
        {displaySkill.date || "날짜 없음"} · {displaySkill.subCategory || displaySkill.category}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
        {displaySkill.title}
      </h1>

      {/* Categories Section with Stats */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-4">카테고리</h3>
            {displaySkill.tags && displaySkill.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displaySkill.tags.map((tag, index) => (
                  <Badge key={index} className="bg-black text-white border-transparent" size="md">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          
          {/* Stats */}
          {(displaySkill.difficulty || displaySkill.viewCount !== undefined || displaySkill.commentCount !== undefined) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {displaySkill.difficulty && (
                <>
                  <div>
                    <span className="font-medium">난이도:</span> {displaySkill.difficulty}
                  </div>
                  {(displaySkill.viewCount !== undefined || displaySkill.commentCount !== undefined) && (
                    <span className="text-gray-300">·</span>
                  )}
                </>
              )}
              {displaySkill.viewCount !== undefined && (
                <>
                  <div>
                    <span className="font-medium">조회수:</span> {displaySkill.viewCount.toLocaleString()}
                  </div>
                  {displaySkill.commentCount !== undefined && (
                    <span className="text-gray-300">·</span>
                  )}
                </>
              )}
              {displaySkill.commentCount !== undefined && (
                <div>
                  <span className="font-medium">댓글:</span> {displaySkill.commentCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium">
          시작하기
        </Button>
        <button className="flex items-center gap-2 text-sm text-black hover:underline">
          예제 코드 보기
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Skill Image */}
      {displaySkill.image && (
        <div className="mb-16 bg-gray-100 rounded-2xl overflow-hidden">
          <div className="aspect-video">
            <img src={displaySkill.image} alt={displaySkill.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      {displaySkill.content ? (
        <div 
          className="space-y-8 [&_p]:text-lg [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:font-normal [&_h2]:text-black [&_h2]:mb-6 [&_h2]:mt-12 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:mb-2 [&_li]:text-gray-700 [&_strong]:font-bold [&_strong]:text-black [&_div]:my-12 [&_div]:rounded-2xl [&_div]:overflow-hidden [&_img]:w-full [&_img]:h-auto"
          dangerouslySetInnerHTML={{ __html: displaySkill.content }}
        />
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            {displaySkill.description}
          </p>
        </div>
      )}

      {/* Related Skills Section */}
      <RelatedSkillsSection currentSkillId={skillId} />
    </article>
  )
}

