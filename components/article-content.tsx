"use client"

import { useState } from "react"
import { ChevronDown, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedProjectsSection } from "@/components/related-projects-section"
import { IconCloud } from "@/components/ui/interactive-icon-cloud"
import { mockArticles } from "@/components/mock/articles"
import { Post } from "@/types/archive"

interface ArticleContentProps {
  selectedPost?: Post | null
}

export function ArticleContent({ selectedPost }: ArticleContentProps) {
  // 선택된 포스트가 있으면 그것을 표시, 없으면 첫 번째 아티클을 기본으로 사용
  const article = mockArticles[0]
  const [activeTab, setActiveTab] = useState<'ai' | 'outsourcing' | 'service'>('ai')

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  // 검색에서 선택된 포스트가 있으면 해당 포스트 내용 표시
  if (selectedPost) {
    return (
      <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
        {/* Date & Category */}
        <div className="text-sm text-gray-500 mb-6">
          {selectedPost.date} · {selectedPost.category}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
          {selectedPost.title}
        </h1>

        {/* Description */}
        {selectedPost.description && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">{selectedPost.description}</p>
        )}

        {/* Tags & Technologies */}
        {(selectedPost.tags || selectedPost.technologies) && (
          <div className="flex flex-wrap gap-2 mb-12">
            {selectedPost.tags?.map((tag, idx) => (
              <span
                key={`tag-${idx}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
            {selectedPost.technologies?.map((tech, idx) => (
              <span
                key={`tech-${idx}`}
                className="px-3 py-1 bg-black text-white text-sm rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        {selectedPost.content && (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedPost.content }}
          />
        )}

        {/* Related Projects Section */}
        <RelatedProjectsSection />
      </article>
    )
  }

  // 기본 아티클 표시
  return (
    <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Date */}
      <div className="text-sm text-gray-500 mb-6">{article.date} · {article.category}</div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
        {article.title}
      </h1>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button 
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium"
            onClick={handleScrollDown}
          >
            아카이브 둘러보기
            <ChevronDown className="ml-2 w-4 h-4" />
          </Button>
          <button 
            className="flex items-center gap-2 text-sm text-black hover:underline"
            onClick={() => window.open('https://lightsoft.dev/', '_blank')}
          >
            홈페이지 가기
            <span className="text-gray-400">→</span>
          </button>
        </div>
        
        {/* Social Media Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button 
            className="flex items-center gap-2 text-sm text-black hover:underline"
            onClick={() => window.open('https://www.instagram.com/lightsoft_crew/', '_blank')}
          >
            <Instagram className="w-4 h-4" />
            Instagram
            <span className="text-gray-400">→</span>
          </button>
          <button 
            className="flex items-center gap-2 text-sm text-black hover:underline"
            onClick={() => window.open('https://www.threads.com/@lightsoft_crew', '_blank')}
          >
            <svg className="w-4 h-4" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.924-10.935 21.341-10.935h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.141-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.483-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.691 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.552ZM98.44 129.507c-9.983.577-21.735-3.568-21.735-13.994 0-8.907 7.779-15.667 18.445-16.028 1.43-.047 2.828-.068 4.189-.068 8.018 0 15.316.824 21.74 2.457-2.979 24.159-13.638 27.053-22.639 27.633Z" />
            </svg>
            Threads
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {article.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-lg text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}

        <p className="text-lg text-gray-700 leading-relaxed">
          외부에는 우리 팀의 기술력과 프로젝트 성과를 홍보하고, 내부에는 지식 자산을 축적하고 재활용하는 공간을 제공합니다.
          카테고리별 필터링, 검색 기능, 유사 항목 추천을 통해 원하는 정보를 빠르게 찾을 수 있습니다.
        </p>

        {/* Lightsoft Section */}
        <div className="mt-20">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-8 text-center">Lightsoft</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
            Lightsoft는 단순히 AI 도구를 사용하는 것을 넘어, AI를 활용한 개발 시스템 자체를 설계합니다. 
            문서화, 자동화, 그리고 지속적인 개선을 통해 누구나 일관된 품질의 결과물을 만들 수 있는 
            지속 가능한 개발 환경을 제공합니다.
          </p>

          {/* Sample Tabs */}
          <div className="flex justify-center gap-6 md:gap-8 mb-12 text-sm overflow-x-auto pb-2">
            <button 
              onClick={() => setActiveTab('ai')}
              className={`pb-2 whitespace-nowrap transition-colors ${
                activeTab === 'ai' ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'
              }`}
            >
              AI 활용 시스템 설계
            </button>
            <button 
              onClick={() => setActiveTab('outsourcing')}
              className={`pb-2 whitespace-nowrap transition-colors ${
                activeTab === 'outsourcing' ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'
              }`}
            >
              소프트웨어 개발 외주
            </button>
            <button 
              onClick={() => setActiveTab('service')}
              className={`pb-2 whitespace-nowrap transition-colors ${
                activeTab === 'service' ? 'border-b-2 border-black font-medium' : 'text-gray-600 hover:text-black'
              }`}
            >
              자체 서비스 개발
            </button>
          </div>

          {/* Feature Example */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {activeTab === 'ai' && (
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="text-sm font-medium text-gray-900 mb-3">AI 활용 시스템 설계</div>
                <div className="text-sm md:text-base text-gray-900 mb-4">
                  단순히 AI를 사용하는 것이 아닙니다
                </div>
                <pre className="bg-white p-4 rounded-xl text-xs md:text-sm overflow-x-auto border border-gray-200">
                  <code>{`-문서화 중심 설계: 누가 개발해도 일관된 결과물
-자동화 파이프라인: 반복 작업은 시스템이
-적응형 아키텍처: 급변하는 AI 기술에 즉시 대응
-시스템 엔지니어링: 전체 개발 생태계 최적화`}</code>
                </pre>
              </div>
            )}

            {activeTab === 'outsourcing' && (
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="text-sm font-medium text-gray-900 mb-3">소프트웨어 개발 외주</div>
                <div className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
                  현금 흐름이 곧 시스템의 양분입니다
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      N
                    </div>
                    <p className="text-sm text-gray-900">네이버 8년 경력 개발자가 이끄는 팀 · 대규모 서비스 개발 경험을 바탕으로 한 전문성</p>
                  </div>
                </div>
                <pre className="bg-white p-4 rounded-xl text-xs md:text-sm overflow-x-auto border border-gray-200">
                  <code>{`-실전에서 검증된 시스템
ERP, CRM 등 기업용 프로그램에 강점
-외주 프로젝트를 통한 지속적인 시스템 개선
-클라이언트의 문제가 우리 시스템의 진화를 만듭니다
-AI 시스템 설계 → 외주 검증 → 시스템 발전의 선순환`}</code>
                </pre>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <div className="text-sm font-medium text-gray-900 mb-3">자체 서비스 개발</div>
                <div className="text-sm md:text-base text-gray-900 mb-4">
                  안정적인 미래를 위한 투자
                </div>
                <pre className="bg-white p-4 rounded-xl text-xs md:text-sm overflow-x-auto border border-gray-200">
                  <code>{`-외주의 불안정성을 자체 서비스로 보완
-꾸준한 현금 흐름 확보 (MRR)
-AI 시스템을 활용한 빠른 MVP 출시
-작게 시작해서 검증된 것만 확장`}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Icon Cloud - Technology Stack Visualization */}
        <div className="my-16">
          <div className="relative flex w-full items-center justify-center overflow-visible">
            <IconCloud iconSlugs={[
              "typescript",
              "javascript",
              "react",
              "nextdotjs",
              "nodedotjs",
              "express",
              "python",
              "openai",
              "supabase",
              "postgresql",
              "vercel",
              "github",
              "git",
              "docker",
              "tailwindcss",
              "figma",
              "visualstudiocode",
              "claude",
              "cursor",
              "notion",
              "slack"
            ]} />
          </div>
        </div>

        {/* Additional content section */}
        <div className="mt-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">핵심 가치</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Light Archive는 지식 자산의 체계적인 관리와 재활용을 통해 팀의 기술력을 지속적으로 향상시킵니다.
            AI 기반 자동화 기능을 통해 콘텐츠 작성 시간을 단축하고, 표준화된 형식으로 일관된 아카이브를 구축할 수 있습니다.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            유사 항목 추천 기능을 통해 같은 카테고리, 라벨, 분야, 기술 스택을 가진 아카이브를 자동으로 연결하여
            사용자가 관련 지식을 쉽게 탐색하고 학습할 수 있도록 지원합니다.
          </p>
        </div>
      </div>

      {/* Related Projects Section */}
      <RelatedProjectsSection />
    </article>
  )
}
