"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RelatedProjectsSection } from "@/components/related-projects-section"

export function ProjectContent() {
  return (
    <article className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
      {/* Date */}
      <div className="text-sm text-gray-500 mb-6">2024년 3월 15일 · 프로젝트</div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black mb-8 leading-tight text-balance">
        AI 기반 콘텐츠 생성 플랫폼
      </h1>

      {/* Categories Section - Added categories with badges */}
      <div className="mb-12">
        <h3 className="text-sm font-medium text-gray-900 mb-4">카테고리</h3>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-black text-white border-transparent" size="md">
            인공지능
          </Badge>
          <Badge className="bg-black text-white border-transparent" size="md">
            머신러닝
          </Badge>
          <Badge className="bg-black text-white border-transparent" size="md">
            자연어처리
          </Badge>
          <Badge className="bg-black text-white border-transparent" size="md">
            웹 개발
          </Badge>
          <Badge className="bg-black text-white border-transparent" size="md">
            클라우드
          </Badge>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
        <Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium">
          프로젝트 시작하기
        </Button>
        <button className="flex items-center gap-2 text-sm text-black hover:underline">
          데모 보기
          <span className="text-gray-400">→</span>
        </button>
      </div>

      {/* Project Image */}
      <div className="mb-16 bg-gray-100 rounded-2xl overflow-hidden">
        <div className="aspect-video">
          <img src="/modern-ai-content-generation-platform-dashboard-in.jpg" alt="Project Dashboard" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          이 프로젝트는 최신 AI 기술을 활용하여 고품질 콘텐츠를 자동으로 생성하는 혁신적인 플랫폼입니다. 사용자는 간단한
          프롬프트만으로 다양한 형식의 콘텐츠를 생성할 수 있습니다.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed">
          자연어 처리와 딥러닝 기술을 결합하여 맥락을 이해하고, 창의적이면서도 정확한 결과물을 제공합니다. 블로그
          포스트, 마케팅 카피, 기술 문서 등 다양한 용도로 활용할 수 있습니다.
        </p>

        <div className="my-12 rounded-2xl overflow-hidden">
          <img src="/ai-content-generation-workflow-diagram-with-neural.jpg" alt="AI Workflow" className="w-full h-auto" />
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-8">주요 기능</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-black mb-3">실시간 생성</h3>
              <p className="text-gray-700 leading-relaxed">
                빠른 응답 속도로 실시간으로 콘텐츠를 생성하고 수정할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-black mb-3">다국어 지원</h3>
              <p className="text-gray-700 leading-relaxed">한국어, 영어를 포함한 20개 이상의 언어를 지원합니다.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-black mb-3">맞춤형 스타일</h3>
              <p className="text-gray-700 leading-relaxed">
                브랜드 톤앤매너에 맞춰 콘텐츠 스타일을 조정할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-medium text-black mb-3">협업 기능</h3>
              <p className="text-gray-700 leading-relaxed">팀원들과 실시간으로 협업하며 콘텐츠를 개선할 수 있습니다.</p>
            </div>
          </div>
        </div>

        <div className="my-16 rounded-2xl overflow-hidden">
          <img src="/team-collaboration-on-ai-platform-with-multiple-us.jpg" alt="Team Collaboration" className="w-full h-auto" />
        </div>

        {/* Technical Details */}
        <div className="mt-16 space-y-6">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">기술 스택</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            이 프로젝트는 최신 웹 기술과 AI 프레임워크를 활용하여 구축되었습니다. Next.js 기반의 프론트엔드와 Python
            기반의 AI 백엔드가 유기적으로 연결되어 있습니다.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge appearance="light" variant="mono" size="lg">
              Next.js
            </Badge>
            <Badge appearance="light" variant="mono" size="lg">
              TypeScript
            </Badge>
            <Badge appearance="light" variant="mono" size="lg">
              Python
            </Badge>
            <Badge appearance="light" variant="mono" size="lg">
              TensorFlow
            </Badge>
            <Badge appearance="light" variant="mono" size="lg">
              PostgreSQL
            </Badge>
            <Badge appearance="light" variant="mono" size="lg">
              Redis
            </Badge>
          </div>
        </div>
      </div>

      {/* Related Projects Section */}
      <RelatedProjectsSection />
    </article>
  )
}
