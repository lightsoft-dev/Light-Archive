"use client"

/**
 * 스킬 섹션 편집기
 *
 * 에이전트가 채운 섹션을 사람이 "다듬는" 것이 주 시나리오다.
 * 그래서 타입별 전용 폼(12종 × 필드 수만큼 UI가 필요하고 스키마가 바뀔 때마다 따라가야 한다)
 * 대신, 구조 조작(추가·삭제·순서)은 버튼으로 내용은 JSON 으로 다룬다.
 *
 * 검증은 두 겹이다 — 여기서 JSON 파싱 오류를 즉시 잡고, 저장할 때 서버가 스키마를 본다.
 */

import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import {
  SECTION_CATALOG,
  SINGLETON_SECTION_TYPES,
  type SkillSection,
  type SkillSectionType,
} from "@/lib/skill-sections"

interface Props {
  sections: SkillSection[]
  onChange: (sections: SkillSection[]) => void
  /** 서버가 돌려준 검증 오류 — { "sections.0.data.tagline": "..." } 형태로 경로별 표시 */
  issues?: { path: string; message: string }[]
}

/** 새 섹션을 추가할 때 넣어줄 최소 뼈대 — 빈 객체면 무엇을 채워야 하는지 알 수 없다 */
const SECTION_TEMPLATES: Record<SkillSectionType, unknown> = {
  hero: { tagline: "" },
  install: { command: "" },
  problem: { pains: [""] },
  before_after: {
    before: { title: "직접 할 때", steps: [""] },
    after: { title: "이 스킬로", steps: [""] },
  },
  triggers: { phrases: [""] },
  steps: { steps: [{ title: "", detail: "" }, { title: "", detail: "" }] },
  demo: { media: [{ kind: "image", url: "" }] },
  scope: { does: [""], doesNot: [""] },
  metrics: { items: [{ label: "", before: "", after: "" }] },
  faq: { items: [{ q: "", a: "" }] },
  code: { language: "bash", code: "" },
  related: { slugs: [""] },
}

export function SkillSectionsEditor({ sections, onChange, issues = [] }: Props) {
  // 편집 중인 JSON 텍스트를 인덱스별로 들고 있는다.
  // 파싱 실패한 상태에서도 사용자가 계속 고칠 수 있어야 하므로 원문을 보존한다.
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [adding, setAdding] = useState(false)

  const usedTypes = useMemo(() => new Set(sections.map((s) => s.type)), [sections])

  function issuesFor(index: number) {
    return issues.filter((issue) => issue.path.startsWith(`${index}.`) || issue.path === String(index))
  }

  function updateSection(index: number, text: string) {
    setDrafts((prev) => ({ ...prev, [index]: text }))
    try {
      const data = JSON.parse(text)
      const next = [...sections]
      next[index] = { ...next[index], data } as SkillSection
      onChange(next)
    } catch {
      // 타이핑 도중에는 깨진 JSON 이 정상이다. 저장 버튼에서 막는다.
    }
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
    setDrafts({}) // 인덱스가 바뀌었으므로 편집 버퍼를 비운다
  }

  function remove(index: number) {
    onChange(sections.filter((_, i) => i !== index))
    setDrafts({})
  }

  function add(type: SkillSectionType) {
    onChange([...sections, { type, data: SECTION_TEMPLATES[type] } as SkillSection])
    setAdding(false)
  }

  function isBrokenJson(index: number): boolean {
    const text = drafts[index]
    if (text === undefined) return false
    try {
      JSON.parse(text)
      return false
    } catch {
      return true
    }
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const entry = SECTION_CATALOG.find((c) => c.type === section.type)
        const sectionIssues = issuesFor(index)
        const broken = isBrokenJson(index)

        return (
          <div
            key={`${section.type}-${index}`}
            className={
              broken || sectionIssues.length
                ? "rounded-xl border border-red-300 bg-red-50/40 p-4"
                : "rounded-xl border border-gray-200 p-4"
            }
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-400">{index + 1}</span>
                <span className="font-medium text-black">{entry?.label ?? section.type}</span>
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">
                  {section.type}
                </code>
                {entry?.required && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] text-white">필수</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-30"
                  aria-label="위로"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sections.length - 1}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black disabled:opacity-30"
                  aria-label="아래로"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <textarea
              value={drafts[index] ?? JSON.stringify(section.data, null, 2)}
              onChange={(e) => updateSection(index, e.target.value)}
              spellCheck={false}
              rows={Math.min(20, JSON.stringify(section.data, null, 2).split("\n").length + 1)}
              className="w-full resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800 focus:border-black focus:outline-none"
            />

            {broken && (
              <p className="mt-2 text-xs text-red-600">JSON 형식이 올바르지 않습니다. 저장할 수 없습니다.</p>
            )}
            {sectionIssues.map((issue) => (
              <p key={issue.path} className="mt-2 text-xs text-red-600">
                <code className="font-mono">{issue.path}</code> — {issue.message}
              </p>
            ))}
          </div>
        )
      })}

      <div className="relative">
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:border-black hover:text-black"
        >
          <Plus className="h-4 w-4" />
          섹션 추가
        </button>

        {adding && (
          <div className="absolute bottom-full z-10 mb-2 w-80 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            {SECTION_CATALOG.map((entry) => {
              // 한 번만 쓸 수 있는 섹션이 이미 있으면 막는다 (서버 스키마와 같은 규칙)
              const disabled = SINGLETON_SECTION_TYPES.includes(entry.type) && usedTypes.has(entry.type)
              return (
                <button
                  key={entry.type}
                  type="button"
                  disabled={disabled}
                  onClick={() => add(entry.type)}
                  className="flex w-full items-baseline gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-35 disabled:hover:bg-transparent"
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-gray-400">{entry.no}</span>
                  <span className="font-medium text-black">{entry.label}</span>
                  <span className="truncate text-xs text-gray-500">{entry.summary}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
