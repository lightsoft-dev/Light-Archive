"use client"

/**
 * 스킬 카탈로그 카드
 *
 * 목록에서 바로 설치할 수 있는 게 핵심이라, 카드 안에 설치 명령과 복사 버튼을 둔다.
 * 카드 전체가 상세 링크이므로 복사 버튼은 이벤트 전파를 막는다.
 */

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, Lock } from "lucide-react"
import type { SkillCatalogItem } from "@/types/skill"

export function SkillCard({ skill }: { skill: SkillCatalogItem }) {
  const [copied, setCopied] = useState(false)
  const meta = skill.skill_meta
  const isInternal = meta?.visibility === "internal"
  const command = isInternal ? meta?.internalPath : meta?.install

  async function handleCopy(e: React.MouseEvent) {
    // 카드 전체가 <Link> 라서 복사 클릭이 페이지 이동으로 새지 않게 막는다
    e.preventDefault()
    e.stopPropagation()
    if (!command) return
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // 클립보드 권한 없는 환경에서는 조용히 실패
    }
  }

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 transition-colors hover:border-black"
    >
      {/* 이미지는 카드 패딩 밖에 둔다. 음수 마진으로 상쇄하면 모서리에서 어긋난다 */}
      {skill.thumbnail_url && (
        <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100">
          <img
            src={skill.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-medium text-black leading-snug">{skill.title}</h3>
          {isInternal && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
              <Lock className="w-3 h-3" />
              사내 전용
            </span>
          )}
        </div>

        <p className="mb-5 mt-2.5 line-clamp-3 text-sm leading-relaxed text-gray-600">{skill.description}</p>

        {command && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <code className="flex-1 truncate font-mono text-xs text-gray-700">{command}</code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="설치 명령 복사"
              className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-black"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {(skill.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
          {typeof skill.view_count === "number" && (
            <span className="shrink-0 text-xs text-gray-400">조회 {skill.view_count}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
