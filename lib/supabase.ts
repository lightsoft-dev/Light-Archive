import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 환경 변수 확인
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.dummy'

// Supabase 클라이언트 생성
// 빌드 타임에는 더미 URL을 사용하여 에러 방지, 런타임에는 실제 환경 변수 사용
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

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

