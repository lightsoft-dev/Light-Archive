"use client"

import { useEffect, useState, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import {
  getComments,
  createComment,
  generateRandomProfile,
  type Comment,
} from "@/lib/supabase-comments"

interface CommentSectionProps {
  archiveId: string
}

export function CommentSection({ archiveId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState(generateRandomProfile)

  // 댓글 목록 로드
  const loadComments = useCallback(async () => {
    const data = await getComments(archiveId)
    setComments(data)
  }, [archiveId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  // 랜덤 프로필 변경
  const handleRandomize = () => {
    setProfile(generateRandomProfile())
  }

  // 댓글 작성
  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      const newComment = await createComment({
        archive_id: archiveId,
        nickname: profile.nickname,
        avatar_emoji: profile.avatar_emoji,
        avatar_bg: profile.avatar_bg,
        content: trimmed,
      })

      if (newComment) {
        setComments((prev) => [newComment, ...prev])
        setContent("")
        // 새 댓글 작성 후 프로필도 새로 변경
        setProfile(generateRandomProfile())
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enter로 제출 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div id="comments" className="mt-16 pt-8 border-t scroll-mt-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 {comments.length > 0 && comments.length}
        </h3>
        <p className="text-xs text-gray-400">
          문의 관련 문의: <a href="mailto:contact@lightsoft.dev" className="underline hover:text-gray-600">contact@lightsoft.dev</a>
        </p>
      </div>

      {/* 댓글 작성 영역 */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        {/* 프로필 영역 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${profile.avatar_bg}`}>
            {profile.avatar_emoji}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{profile.nickname}</span>
          </div>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            랜덤 변경
          </button>
        </div>

        {/* 텍스트 입력 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="입력한 댓글은 수정하거나 삭제할 수 없어요. 또한 허위사실, 욕설, 사칭 등 댓글은 통보없이 삭제될 수 있습니다."
          className="w-full min-h-[120px] p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
        />

        {/* 제출 버튼 */}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="px-6 py-2.5 bg-blue-400 text-white text-sm font-medium rounded-full hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "등록 중..." : "댓글 남기기"}
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-2xl p-6"
            >
              {/* 작성자 정보 */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${comment.avatar_bg}`}>
                  {comment.avatar_emoji}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(comment.created_at)}
                  </span>
                </div>
              </div>

              {/* 댓글 내용 */}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 text-sm">
          아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요!
        </div>
      )}
    </div>
  )
}

/**
 * 상대 시간 포맷 (예: "방금 전", "3분 전", "2시간 전", "어제")
 */
function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
