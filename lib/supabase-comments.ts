/**
 * Supabase 댓글 데이터 접근 함수들
 * archive_comments 테이블과 상호작용
 */

import { supabase } from "./supabase"

export interface Comment {
  id: string
  archive_id: string
  nickname: string
  avatar_emoji: string
  avatar_bg: string
  content: string
  created_at: string
}

type CreateCommentInput = Omit<Comment, "id" | "created_at">

/**
 * 특정 아카이브의 댓글 목록 가져오기
 */
export async function getComments(archiveId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("archive_comments")
    .select("*")
    .eq("archive_id", archiveId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  return data || []
}

/**
 * 댓글 작성
 */
export async function createComment(comment: CreateCommentInput): Promise<Comment | null> {
  const { data, error } = await supabase
    .from("archive_comments")
    .insert([comment])
    .select()
    .single()

  if (error) {
    console.error("Error creating comment:", error)
    return null
  }

  return data
}

/**
 * 여러 아카이브의 댓글 수를 한번에 가져오기
 * { archiveId: count } 형태로 반환
 */
export async function getCommentCounts(archiveIds: string[]): Promise<Record<string, number>> {
  if (archiveIds.length === 0) return {}

  const { data, error } = await supabase
    .from("archive_comments")
    .select("archive_id")
    .in("archive_id", archiveIds)

  if (error) {
    console.error("Error fetching comment counts:", error)
    return {}
  }

  // archive_id별로 카운트 집계
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.archive_id] = (counts[row.archive_id] || 0) + 1
  }
  return counts
}

// --- 랜덤 닉네임 & 아바타 생성 ---

const ADJECTIVES = [
  "다정한", "씩씩한", "활기찬", "용감한", "똑똑한",
  "느긋한", "호기심많은", "상냥한", "재빠른", "유쾌한",
  "차분한", "명랑한", "겸손한", "든든한", "산뜻한",
  "따뜻한", "쾌활한", "꼼꼼한", "열정적인", "소심한",
  "당당한", "수줍은", "귀여운", "멋진", "신나는",
]

const ANIMALS = [
  "알파카", "치타", "호랑이", "판다", "고양이",
  "강아지", "토끼", "여우", "코알라", "수달",
  "펭귄", "돌고래", "햄스터", "다람쥐", "부엉이",
  "사슴", "곰", "물개", "너구리", "두루미",
  "고슴도치", "카멜레온", "해달", "비버", "앵무새",
]

const AVATAR_EMOJIS = [
  "🐰", "🐱", "🐶", "🦊", "🐻",
  "🐼", "🐨", "🐯", "🦁", "🐮",
  "🐷", "🐸", "🐵", "🐔", "🐧",
  "🐤", "🦄", "🐙", "🦋", "🐢",
  "🐬", "🦜", "🦔", "🐿️", "🦉",
]

const AVATAR_BGS = [
  "bg-purple-100", "bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-pink-100",
  "bg-indigo-100", "bg-teal-100", "bg-orange-100", "bg-rose-100", "bg-cyan-100",
  "bg-lime-100", "bg-amber-100", "bg-emerald-100", "bg-violet-100", "bg-fuchsia-100",
]

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 랜덤 프로필 생성 (닉네임 + 이모지 아바타 + 배경색)
 */
export function generateRandomProfile() {
  return {
    nickname: `${randomPick(ADJECTIVES)}${randomPick(ANIMALS)}`,
    avatar_emoji: randomPick(AVATAR_EMOJIS),
    avatar_bg: randomPick(AVATAR_BGS),
  }
}
