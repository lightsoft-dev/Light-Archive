import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase 클라이언트 생성 (환경 변수가 없으면 빈 문자열로 초기화하여 런타임 에러 방지)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

// 환경 변수 확인 헬퍼 함수 (런타임 체크용)
export function checkSupabaseConfig() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
}

// 타입 정의 (필요시 사용)
export type Database = {
  // 여기에 데이터베이스 타입을 정의할 수 있습니다
  // Supabase CLI의 타입 생성 기능을 사용하면 자동으로 생성됩니다
}

