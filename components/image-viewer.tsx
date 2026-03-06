"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ImageViewerProps {
  src: string
  alt?: string
  onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.5

/**
 * 이미지 확대/축소/드래그가 가능한 라이트박스 뷰어
 * - 마우스 휠: 줌 인/아웃
 * - 드래그: 이미지 이동 (확대 상태에서)
 * - 더블클릭: 확대/원래 크기 토글
 * - 핀치: 모바일 줌
 */
export function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const positionRef = useRef({ x: 0, y: 0 })
  const lastPinchDistance = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 위치를 리셋하는 함수
  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    positionRef.current = { x: 0, y: 0 }
  }, [])

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    // 배경 스크롤 방지
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  // 마우스 휠 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale((prev) => {
      const next = e.deltaY < 0 ? prev + ZOOM_STEP : prev - ZOOM_STEP
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
      if (clamped === 1) {
        setPosition({ x: 0, y: 0 })
        positionRef.current = { x: 0, y: 0 }
      }
      return clamped
    })
  }, [])

  // 더블클릭 토글 줌
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetView()
    } else {
      setScale(3)
    }
  }, [scale, resetView])

  // 드래그 시작
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (scale <= 1) return
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - positionRef.current.x,
        y: e.clientY - positionRef.current.y,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [scale]
  )

  // 드래그 중
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || scale <= 1) return
      const newPos = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      }
      positionRef.current = newPos
      setPosition(newPos)
    },
    [isDragging, scale]
  )

  // 드래그 끝
  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 모바일 핀치 줌
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return
    e.preventDefault()

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )

    if (lastPinchDistance.current !== null) {
      const delta = distance - lastPinchDistance.current
      setScale((prev) => {
        const next = prev + delta * 0.01
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next))
      })
    }
    lastPinchDistance.current = distance
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null
  }, [])

  // 줌 버튼
  const zoomIn = () => setScale((prev) => Math.min(MAX_SCALE, prev + ZOOM_STEP))
  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, prev - ZOOM_STEP)
      if (next === 1) {
        setPosition({ x: 0, y: 0 })
        positionRef.current = { x: 0, y: 0 }
      }
      return next
    })
  }

  // 배경 클릭 시 닫기 (이미지 영역 외)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* 상단 컨트롤 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="축소"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm font-mono min-w-[4rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="확대"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="원래 크기"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 이미지 영역 */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden select-none"
        onClick={handleBackdropClick}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt || ""}
          className="max-w-[90vw] max-h-[85vh] object-contain pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          draggable={false}
        />
      </div>

      {/* 하단 안내 */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/50 text-xs">
          더블클릭으로 확대 | 스크롤로 줌 | 드래그로 이동
        </p>
      </div>
    </div>
  )
}
