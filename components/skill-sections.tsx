"use client"

/**
 * 스킬 상세 페이지의 섹션 렌더러
 *
 * lib/skill-sections.ts 의 스키마와 1:1 대응한다.
 * 알 수 없는 type 이 들어오면 렌더를 건너뛴다 — 나중에 섹션을 추가해도
 * 배포 타이밍 차이로 기존 페이지가 깨지지 않게 하기 위함.
 */

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, ArrowRight, X } from "lucide-react"
import type { SkillSection } from "@/lib/skill-sections"

// ---------------------------------------------------------------------------
// 공통 조각
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-normal text-black mb-6">{children}</h2>
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="mb-16">{children}</section>
}

/** 코드/명령을 클립보드로 복사. 스킬 페이지의 핵심 동작이라 눈에 띄게 둔다 */
function CopyButton({ value, label = "복사" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // 클립보드 권한이 없는 환경(비 HTTPS 등)에서는 조용히 실패시킨다
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="inline-flex items-center gap-1.5 shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "복사됨" : label}
    </button>
  )
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="rounded-xl bg-black overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-white/10">
        <span className="text-xs text-gray-500 font-mono">{language || "bash"}</span>
        <CopyButton value={code} />
      </div>
      <pre className="px-4 py-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-100 whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 1. hero
// ---------------------------------------------------------------------------

function HeroSection({ data }: { data: Extract<SkillSection, { type: "hero" }>["data"] }) {
  return (
    <section className="mb-14">
      <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">{data.tagline}</p>
      {data.badges && data.badges.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {data.badges.map((badge) => (
            <span
              key={`${badge.label}-${badge.value}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs"
            >
              <span className="text-gray-500">{badge.label}</span>
              <span className="font-medium text-black">{badge.value}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// 2. install
// ---------------------------------------------------------------------------

function InstallSection({ data }: { data: Extract<SkillSection, { type: "install" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>설치</SectionHeading>
      <CodeBlock code={data.command} language="bash" />
      {data.note && <p className="mt-3 text-sm text-gray-500">{data.note}</p>}

      {data.prerequisites && data.prerequisites.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-black mb-3">먼저 준비할 것</h3>
          <ul className="space-y-2">
            {data.prerequisites.map((item) => (
              <li key={item} className="flex gap-2.5 text-gray-700">
                <span className="text-gray-300 select-none">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.envVars && data.envVars.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-black mb-3">필요한 환경변수</h3>
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-200">
            {data.envVars.map((env) => (
              <div key={env.name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6">
                <code className="font-mono text-sm text-black shrink-0 sm:w-64">{env.name}</code>
                <span className="text-sm text-gray-600">{env.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 3. problem
// ---------------------------------------------------------------------------

function ProblemSection({ data }: { data: Extract<SkillSection, { type: "problem" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>이런 게 반복된다면</SectionHeading>
      {data.context && <p className="text-lg text-gray-700 leading-relaxed mb-6">{data.context}</p>}
      <ul className="space-y-3">
        {data.pains.map((pain) => (
          <li key={pain} className="flex gap-3 text-lg text-gray-700">
            <span className="text-gray-300 select-none mt-1">·</span>
            <span>{pain}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 4. before_after
// ---------------------------------------------------------------------------

function BeforeAfterSection({ data }: { data: Extract<SkillSection, { type: "before_after" }>["data"] }) {
  const sides = [
    { key: "before" as const, side: data.before, tone: "muted" as const },
    { key: "after" as const, side: data.after, tone: "strong" as const },
  ]

  return (
    <Section>
      <SectionHeading>이렇게 바뀐다</SectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        {sides.map(({ key, side, tone }) => (
          <div
            key={key}
            className={
              tone === "strong"
                ? "rounded-2xl border border-black bg-black text-white p-6"
                : "rounded-2xl border border-gray-200 bg-gray-50 p-6"
            }
          >
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h3 className={tone === "strong" ? "font-medium" : "font-medium text-gray-500"}>
                {side.title}
              </h3>
              {side.cost && (
                <span
                  className={
                    tone === "strong"
                      ? "text-sm font-mono text-gray-300"
                      : "text-sm font-mono text-gray-400"
                  }
                >
                  {side.cost}
                </span>
              )}
            </div>
            <ol className="space-y-2.5">
              {side.steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    className={
                      tone === "strong"
                        ? "font-mono text-gray-500 shrink-0"
                        : "font-mono text-gray-300 shrink-0"
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={tone === "strong" ? "text-gray-100" : "text-gray-600"}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 5. triggers
// ---------------------------------------------------------------------------

function TriggersSection({ data }: { data: Extract<SkillSection, { type: "triggers" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>이렇게 말하면 발동합니다</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {data.phrases.map((phrase) => (
          <span
            key={phrase}
            className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-800"
          >
            “{phrase}”
          </span>
        ))}
      </div>
      {data.notFor && data.notFor.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-black mb-3">이런 건 이 스킬이 아닙니다</h3>
          <ul className="space-y-2">
            {data.notFor.map((item) => (
              <li key={item} className="flex gap-2.5 text-gray-500">
                <X className="w-4 h-4 mt-1 shrink-0 text-gray-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 6. steps
// ---------------------------------------------------------------------------

function StepsSection({ data }: { data: Extract<SkillSection, { type: "steps" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>어떻게 동작하나</SectionHeading>
      <ol className="relative border-l border-gray-200 ml-3">
        {data.steps.map((step, i) => (
          <li key={step.title} className="relative pl-8 pb-8 last:pb-0">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] font-mono text-white">
              {i + 1}
            </span>
            <h3 className="font-medium text-black mb-1.5">{step.title}</h3>
            <p className="text-gray-700 leading-relaxed">{step.detail}</p>
            {step.output && (
              <p className="mt-2 font-mono text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 inline-block">
                → {step.output}
              </p>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 7. demo
// ---------------------------------------------------------------------------

function DemoSection({ data }: { data: Extract<SkillSection, { type: "demo" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>이렇게 돌아갑니다</SectionHeading>
      <div className="space-y-6">
        {data.media.map((item) => (
          <figure key={item.url}>
            <div className="rounded-2xl overflow-hidden bg-gray-100">
              {item.kind === "video" ? (
                <video src={item.url} controls playsInline className="w-full h-auto" />
              ) : (
                <img src={item.url} alt={item.caption || ""} className="w-full h-auto" />
              )}
            </div>
            {item.caption && (
              <figcaption className="mt-2.5 text-sm text-gray-500">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 8. scope
// ---------------------------------------------------------------------------

function ScopeSection({ data }: { data: Extract<SkillSection, { type: "scope" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>경계</SectionHeading>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h3 className="font-medium text-black mb-4">하는 일</h3>
          <ul className="space-y-2.5">
            {data.does.map((item) => (
              <li key={item} className="flex gap-2.5 text-gray-700">
                <Check className="w-4 h-4 mt-1 shrink-0 text-black" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-medium text-gray-500 mb-4">하지 않는 일</h3>
          <ul className="space-y-2.5">
            {data.doesNot.map((item) => (
              <li key={item} className="flex gap-2.5 text-gray-500">
                <X className="w-4 h-4 mt-1 shrink-0 text-gray-300" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 9. metrics
// ---------------------------------------------------------------------------

function MetricsSection({ data }: { data: Extract<SkillSection, { type: "metrics" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>숫자로</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-4">{item.label}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-lg text-gray-400 line-through decoration-gray-300">
                {item.before}
                {item.unit}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              <span className="text-3xl font-normal text-black">
                {item.after}
                {item.unit && <span className="text-lg text-gray-500 ml-0.5">{item.unit}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 10. faq
// ---------------------------------------------------------------------------

function FaqSection({ data }: { data: Extract<SkillSection, { type: "faq" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>자주 막히는 지점</SectionHeading>
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {data.items.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-black list-none">
              {item.q}
              <span className="text-gray-300 transition-transform group-open:rotate-45 select-none text-xl leading-none">
                +
              </span>
            </summary>
            <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 11. code
// ---------------------------------------------------------------------------

function CodeSection({ data }: { data: Extract<SkillSection, { type: "code" }>["data"] }) {
  return (
    <Section>
      {data.caption && <h3 className="text-sm font-medium text-black mb-3">{data.caption}</h3>}
      <CodeBlock code={data.code} language={data.language} />
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 12. related
// ---------------------------------------------------------------------------

function RelatedSection({ data }: { data: Extract<SkillSection, { type: "related" }>["data"] }) {
  return (
    <Section>
      <SectionHeading>함께 쓰는 스킬</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {data.slugs.map((slug) => (
          <Link
            key={slug}
            href={`/skills/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-black hover:text-black transition-colors"
          >
            {slug}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ))}
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------------------
// 디스패처
// ---------------------------------------------------------------------------

function renderSection(section: SkillSection, key: number) {
  switch (section.type) {
    case "hero":
      return <HeroSection key={key} data={section.data} />
    case "install":
      return <InstallSection key={key} data={section.data} />
    case "problem":
      return <ProblemSection key={key} data={section.data} />
    case "before_after":
      return <BeforeAfterSection key={key} data={section.data} />
    case "triggers":
      return <TriggersSection key={key} data={section.data} />
    case "steps":
      return <StepsSection key={key} data={section.data} />
    case "demo":
      return <DemoSection key={key} data={section.data} />
    case "scope":
      return <ScopeSection key={key} data={section.data} />
    case "metrics":
      return <MetricsSection key={key} data={section.data} />
    case "faq":
      return <FaqSection key={key} data={section.data} />
    case "code":
      return <CodeSection key={key} data={section.data} />
    case "related":
      return <RelatedSection key={key} data={section.data} />
    default:
      // 알 수 없는 섹션은 건너뛴다 (새 섹션 타입이 배포보다 먼저 들어와도 페이지가 살아있게)
      console.warn("[skill-sections] 알 수 없는 섹션 타입:", (section as { type: string }).type)
      return null
  }
}

export function SkillSectionRenderer({ sections }: { sections: SkillSection[] }) {
  return <>{sections.map((section, i) => renderSection(section, i))}</>
}
