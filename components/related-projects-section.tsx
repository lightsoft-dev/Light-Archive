"use client"

import Link from "next/link"

export function RelatedProjectsSection() {
  const projects = [
    {
      id: "1",
      title: "AI 챗봇 플랫폼",
      description: "고객 서비스를 위한 지능형 챗봇 솔루션",
      image: "/ai-chatbot-interface-icon.jpg",
      category: "프로젝트",
    },
    {
      id: "2",
      title: "데이터 분석 대시보드",
      description: "실시간 데이터 시각화 및 인사이트 도구",
      image: "/data-analytics-dashboard-icon.jpg",
      category: "프로젝트",
    },
    {
      id: "3",
      title: "이미지 생성 AI",
      description: "텍스트로 고품질 이미지를 생성하는 도구",
      image: "/image-generation-ai-tool-icon.jpg",
      category: "프로젝트",
    },
    {
      id: "4",
      title: "음성 비서 시스템",
      description: "자연스러운 대화가 가능한 음성 AI",
      image: "/voice-assistant-ai-icon.jpg",
      category: "프로젝트",
    },
  ]

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl md:text-3xl font-normal text-black mb-6">관련 아카이브</h2>
      
      <div className="space-y-0">
        {projects.map((project, index) => (
          <div key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="group block py-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{project.category}</div>
                  <h3 className="text-base font-medium text-black mb-1 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </div>
              </div>
            </Link>
            {index < projects.length - 1 && (
              <div className="border-b border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

