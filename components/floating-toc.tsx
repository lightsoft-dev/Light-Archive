"use client"

import { useEffect, useState } from "react"
import { List } from "lucide-react"

interface TocItem {
  id: string
  text: string
}

/**
 * 본문 내 h2[id] 태그를 파싱하여 왼쪽에 플로팅으로 표시하는 목차 컴포넌트
 * - 스크롤 위치에 따라 현재 섹션 하이라이트
 * - 데스크톱(xl 이상)에서만 표시
 */
export function FloatingToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [isOpen, setIsOpen] = useState(true)

  // h2[id] 요소 수집
  useEffect(() => {
    const timer = setTimeout(() => {
      const headings = document.querySelectorAll<HTMLHeadingElement>(".archive-content h2[id]")
      const tocItems: TocItem[] = []
      headings.forEach((h) => {
        if (h.id && h.textContent) {
          tocItems.push({ id: h.id, text: h.textContent.trim() })
        }
      })
      setItems(tocItems)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // 스크롤 위치 기반 활성 섹션 추적
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      let currentId = ""
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            currentId = id
          }
        }
      }
      if (currentId) setActiveId(currentId)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20 max-w-[200px]">
      {isOpen ? (
        <nav className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">목차</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xs"
              aria-label="목차 닫기"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById(item.id)
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" })
                      setActiveId(item.id)
                    }
                  }}
                  className={`block text-sm py-1.5 px-2 rounded-lg transition-all duration-200 leading-snug ${
                    activeId === item.id
                      ? "text-black font-semibold bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 p-3 hover:bg-white transition-colors"
          aria-label="목차 열기"
        >
          <List className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  )
}
