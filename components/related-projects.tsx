"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useState } from "react"

export function RelatedProjects() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <aside className="fixed bottom-6 right-6 w-72 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg z-30 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">유사 프로젝트</h3>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-gray-100/50 rounded-md transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        <Link href="/projects/1" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img src="/ai-chatbot-interface-icon.jpg" alt="Project thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                AI 챗봇 플랫폼
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">고객 서비스를 위한 지능형 챗봇 솔루션</p>
            </div>
          </div>
        </Link>

        <Link href="/projects/2" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img src="/data-analytics-dashboard-icon.jpg" alt="Project thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                데이터 분석 대시보드
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">실시간 데이터 시각화 및 인사이트 도구</p>
            </div>
          </div>
        </Link>

        <Link href="/projects/3" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img src="/image-generation-ai-tool-icon.jpg" alt="Project thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                이미지 생성 AI
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">텍스트로 고품질 이미지를 생성하는 도구</p>
            </div>
          </div>
        </Link>

        <Link href="/projects/4" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group">
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img src="/voice-assistant-ai-icon.jpg" alt="Project thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                음성 비서 시스템
              </h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">자연스러운 대화가 가능한 음성 AI</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
