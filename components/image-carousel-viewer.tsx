"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"

export interface CarouselViewerImage {
  src: string
  alt?: string
}

/**
 * 아카이브 본문 안의 이미지 슬라이더(캐러셀)를 렌더하는 뷰어 컴포넌트.
 *
 * - 저장된 HTML(<div class="image-carousel"><img>...</div>)을 archive-content에서
 *   파싱해 이 컴포넌트로 치환한다. (dangerouslySetInnerHTML 내부를 직접 DOM 조작하면
 *   React가 되돌리므로, 캐러셀만 정식 React 컴포넌트로 렌더한다)
 * - embla-carousel로 좌우 화살표 / dot 인디케이터 / 터치 스와이프를 제공한다.
 */
export function ImageCarouselViewer({
  images,
  onImageClick,
}: {
  images: CarouselViewerImage[]
  onImageClick?: (src: string) => void
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    loop: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const hasMultiple = images.length > 1

  return (
    <div className="image-carousel-viewer">
      <div className="ic-viewport" ref={emblaRef}>
        <div className="ic-container">
          {images.map((img, i) => (
            <div className="ic-slide" key={`${img.src}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || ""}
                loading="lazy"
                onClick={() => onImageClick?.(img.src)}
              />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            className="ic-arrow prev"
            aria-label="이전 이미지"
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
          >
            ‹
          </button>
          <button
            type="button"
            className="ic-arrow next"
            aria-label="다음 이미지"
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
          >
            ›
          </button>

          <div className="ic-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`ic-dot${i === selectedIndex ? " active" : ""}`}
                aria-label={`${i + 1}번째 이미지로 이동`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
