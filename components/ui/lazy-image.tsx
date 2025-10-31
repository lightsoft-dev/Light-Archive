'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { useInView } from 'framer-motion'
import { AspectRatio } from '@/components/ui/aspect-ratio'

interface LazyImageProps {
  alt: string
  src: string
  className?: string
  AspectRatioClassName?: string
  /** 대체 이미지 URL. 기본값: undefined */
  fallback?: string
  /** 이미지 비율 */
  ratio: number
  /** 뷰포트에 들어올 때만 이미지를 로드할지 여부. 기본값: false */
  inView?: boolean
}

export function LazyImage({
  alt,
  src,
  ratio,
  fallback,
  inView = false,
  className,
  AspectRatioClassName,
}: LazyImageProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const isInView = useInView(ref, { once: true })
  const [imgSrc, setImgSrc] = React.useState<string | undefined>(
    inView ? undefined : src,
  )
  const [isLoading, setIsLoading] = React.useState(true)

  const handleError = () => {
    if (fallback) {
      setImgSrc(fallback)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // 뷰포트에 들어올 때만 이미지 로드
  React.useEffect(() => {
    if (inView && isInView && !imgSrc) {
      setImgSrc(src)
    }
  }, [inView, isInView, src, imgSrc])

  // 캐시된 이미지 즉시 처리
  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      handleLoad()
    }
  }, [imgSrc])

  return (
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className={cn(
        'relative size-full overflow-hidden rounded-lg border',
        AspectRatioClassName,
      )}
    >
      {/* 스켈레톤 / 대체 이미지 */}
      <div
        className={cn(
          'bg-accent/30 absolute inset-0 animate-pulse rounded-lg transition-opacity will-change-[opacity]',
          { 'opacity-0': !isLoading },
        )}
      />
      {imgSrc && (
        <img
          ref={imgRef}
          alt={alt}
          src={imgSrc}
          className={cn(
            'size-full rounded-lg object-cover opacity-0 transition-opacity duration-2000 will-change-[opacity]',
            {
              'opacity-100': !isLoading,
            },
            className,
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          fetchPriority={inView ? 'high' : 'low'}
        />
      )}
    </AspectRatio>
  )
}

