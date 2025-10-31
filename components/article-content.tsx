"use client"

import { Play, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedProjectsSection } from "@/components/related-projects-section"

export function ArticleContent() {
  return (
    <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Date */}
      <div className="text-sm text-gray-500 mb-6">2024년 12월 · 제품</div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
        Light Archive 소개
      </h1>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium">
          아카이브 둘러보기
        </Button>
        <button className="flex items-center gap-2 text-sm text-black hover:underline">
          관리자 페이지로 이동
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Video Player */}
      <div className="mb-16 bg-gray-100 rounded-2xl overflow-hidden">
        <div className="aspect-video flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-black">
            <span>문서 내용 듣기</span>
            <span className="text-gray-600">0:04</span>
          </div>
          <div className="absolute bottom-4 right-4">
            <button className="p-2 hover:bg-gray-200 rounded-md transition-colors">
              <LinkIcon className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          Light Archive는 AI 기반 기술과 프로젝트 아카이브 플랫폼입니다. 대화 형식을 통해 Light Archive는 복잡한 기술 지식을
          체계적으로 정리하고, 관련 항목을 자동으로 추천하며, 지식 자산을 효율적으로 관리할 수 있도록 도와줍니다.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed">
          Light Archive는 Rich Text와 Markdown을 지원하는 에디터로, 기술 문서와 프로젝트 성과를 쉽게 기록하고 관리할 수 있습니다.
          AI 기반 초안 생성, 요약, 태그 자동 제안 기능을 통해 콘텐츠 작성의 효율성을 높입니다.
        </p>

        <div className="my-12 rounded-2xl overflow-hidden">
          <img src="/modern-ai-interface-dashboard-with-chat-bubbles.jpg" alt="Light Archive Interface" className="w-full h-auto" />
        </div>

        <p className="text-lg text-gray-700 leading-relaxed">
          외부에는 우리 팀의 기술력과 프로젝트 성과를 홍보하고, 내부에는 지식 자산을 축적하고 재활용하는 공간을 제공합니다.
          카테고리별 필터링, 검색 기능, 유사 항목 추천을 통해 원하는 정보를 빠르게 찾을 수 있습니다.
        </p>

        {/* Samples Section */}
        <div className="mt-20">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-8 text-center">주요 기능</h2>

          {/* Sample Tabs */}
          <div className="flex justify-center gap-6 md:gap-8 mb-12 text-sm overflow-x-auto pb-2">
            <button className="pb-2 border-b-2 border-black font-medium whitespace-nowrap">기술 아카이브</button>
            <button className="pb-2 text-gray-600 hover:text-black whitespace-nowrap transition-colors">프로젝트</button>
            <button className="pb-2 text-gray-600 hover:text-black whitespace-nowrap transition-colors">
              리서치
            </button>
            <button className="pb-2 text-gray-600 hover:text-black whitespace-nowrap transition-colors">
              뉴스
            </button>
          </div>

          {/* Feature Example */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
              <div className="text-sm font-medium text-gray-900 mb-3">관리자</div>
              <div className="text-sm md:text-base text-gray-900 mb-4">
                새로운 기술 아카이브를 작성하려고 합니다. LLM 기반 질의응답 시스템에 대한 내용입니다.
              </div>
              <pre className="bg-white p-4 rounded-xl text-xs md:text-sm overflow-x-auto border border-gray-200">
                <code>{`카테고리: 기술
라벨: LLM, NLP, Generative AI
분야: 자연어 처리
사용 기술: OpenAI API, FastAPI, React
난이도: 중급`}</code>
              </pre>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 md:p-8">
              <div className="text-sm font-medium text-gray-900 mb-3">AI 초안 생성</div>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                기술 카테고리 기준으로 초안을 생성했습니다. 기술 배경, 문제 정의, 해결 접근, 기대 효과 구조로 작성되었습니다.
                본문을 확인하고 필요에 따라 수정해주세요.
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
              <div className="text-sm font-medium text-gray-900 mb-3">관리자</div>
              <div className="text-sm md:text-base text-gray-900">
                초안이 잘 작성되었네요. 추가로 요약문과 태그도 자동 생성해주세요.
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 md:p-8">
              <div className="text-sm font-medium text-gray-900 mb-3">AI 요약 및 태그</div>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                요약문: "LLM 기반 질의응답 시스템 구축 프로젝트. OpenAI API를 활용한 자연어 처리 기술을 적용하여
                고객 지원 챗봇을 개발했습니다."
                제안 태그: LLM, NLP, Generative AI, Chatbot, OpenAI API
              </div>
            </div>
          </div>
        </div>

        <div className="my-16 rounded-2xl overflow-hidden">
          <img src="/ai-technology-abstract-visualization-with-neural-n.jpg" alt="AI Technology" className="w-full h-auto" />
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
