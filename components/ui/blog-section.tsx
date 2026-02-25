'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, Eye } from 'lucide-react'
import { LazyImage } from './lazy-image'

export interface BlogItem {
  id: string
  title: string
  slug: string
  description: string
  image: string
  createdAt: string
  author: string
  readTime: string
  viewCount?: number
}

type ViewMode = 'grid' | 'list'

interface BlogSectionProps {
  title: string
  description: string
  blogs: BlogItem[]
  categoryLabels?: Record<string, string>
  currentCategory?: string
  basePath?: string
  className?: string
}

export function BlogSection({ 
  title,
  description,
  blogs,
  categoryLabels,
  currentCategory = 'all',
  basePath = '',
  className = '',
}: BlogSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  return (
    <div className={`mx-auto w-full max-w-5xl grow ${className}`}>
      {/* 배경 효과 */}
      <div
        aria-hidden
        className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
      >
        <div className="-rotate-45 bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 rounded-full" />
        <div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
        <div className="-rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 rounded-full" />
      </div>

      {/* 헤더 */}
      <div className="space-y-1 px-4 py-8">
        <h1 className="font-mono text-4xl font-bold tracking-wide">
          {title}
        </h1>
        <p className="text-muted-foreground text-base">
          {description}
        </p>
      </div>

      {/* 카테고리 필터 및 뷰 모드 전환 */}
      <div className="px-4 pb-4 flex items-center justify-between gap-4">
        {categoryLabels && Object.keys(categoryLabels).length > 0 && (
          <div className="flex gap-2 overflow-x-auto flex-1">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <Link
                key={key}
                href={key === "all" ? basePath : `${basePath}?category=${key}`}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentCategory === key
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
        
        {/* 뷰 모드 전환 버튼 */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="그리드 뷰"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="리스트 뷰"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 구분선 */}
      <div className="absolute inset-x-0 h-px w-full border-b border-dashed" />

      {/* 블로그 그리드/리스트 */}
      {blogs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          해당 카테고리의 항목이 없습니다.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid p-4 md:grid-cols-2 lg:grid-cols-3 z-10 gap-4">
          {blogs.map((blog) => (
            <Link
              href={blog.slug}
              key={blog.id}
              className="group hover:bg-gray-50 active:bg-gray-100 flex flex-col gap-2 rounded-lg p-2 duration-75 transition-colors"
            >
              <LazyImage
                src={blog.image}
                fallback="/placeholder-image.png"
                inView={true}
                alt={blog.title}
                ratio={16 / 9}
                className="transition-all duration-500 group-hover:scale-105"
              />
              <div className="space-y-2 px-2 pb-2">
                <div className="text-muted-foreground flex items-center gap-2 text-[11px] sm:text-xs">
                  <p>{blog.author} 작성</p>
                  <div className="bg-muted-foreground size-1 rounded-full" />
                  <p>{blog.createdAt}</p>
                  <div className="bg-muted-foreground size-1 rounded-full" />
                  <p>{blog.readTime}</p>
                </div>
                <h2 className="line-clamp-2 text-lg leading-5 font-semibold tracking-tight text-black">
                  {blog.title}
                </h2>
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {blog.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3 p-4 z-10">
          {blogs.map((blog) => (
            <Link
              href={blog.slug}
              key={blog.id}
              className="group hover:bg-gray-50 active:bg-gray-100 flex gap-3 rounded-lg p-3 duration-75 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="flex-shrink-0 w-32 h-20 overflow-hidden rounded-lg">
                <LazyImage
                  src={blog.image}
                  fallback="/placeholder-image.png"
                  inView={true}
                  alt={blog.title}
                  ratio={16 / 9}
                  className="transition-all duration-500 group-hover:scale-105 w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold tracking-tight text-black transition-colors line-clamp-1">
                    {blog.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {blog.description}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <p>{blog.author}</p>
                    <div className="bg-muted-foreground size-1 rounded-full" />
                    <p>{blog.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {blog.viewCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{blog.viewCount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

