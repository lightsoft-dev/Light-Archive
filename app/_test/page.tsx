'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Database, HardDrive, Globe, AlertCircle } from 'lucide-react'

export default function SupabaseTestPage() {
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [storageStatus, setStorageStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  
  const [dbResult, setDbResult] = useState<string>('')
  const [storageResult, setStorageResult] = useState<string>('')
  const [connectionResult, setConnectionResult] = useState<string>('')
  const [dbError, setDbError] = useState<string>('')
  const [storageError, setStorageError] = useState<string>('')
  const [connectionError, setConnectionError] = useState<string>('')

  // 연결 테스트
  const testConnection = async () => {
    setConnectionStatus('testing')
    setConnectionError('')
    setConnectionResult('')

    try {
      // 간단한 헬스 체크 - Supabase 클라이언트가 정상적으로 초기화되었는지 확인
      const { data, error } = await supabase.from('_test').select('*').limit(0)
      
      if (error) {
        // 테이블이 없어도 연결은 정상일 수 있음
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          setConnectionStatus('success')
          setConnectionResult('✅ Supabase 연결 성공! (테이블이 없어도 연결은 정상입니다)')
        } else {
          throw error
        }
      } else {
        setConnectionStatus('success')
        setConnectionResult('✅ Supabase 연결 성공!')
      }
    } catch (error: any) {
      setConnectionStatus('error')
      setConnectionError(error.message || '연결 실패')
      setConnectionResult('❌ 연결 실패')
    }
  }

  // 데이터베이스 테스트
  const testDatabase = async () => {
    setDbStatus('testing')
    setDbError('')
    setDbResult('')

    try {
      // 간단한 쿼리 테스트 (테이블이 없으면 에러가 나지만, 연결은 확인됨)
      const { data, error } = await supabase
        .from('test_table')
        .select('*')
        .limit(1)

      if (error) {
        // 테이블이 없는 경우도 연결은 성공한 것으로 간주
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setDbStatus('success')
          setDbResult('✅ 데이터베이스 연결 성공! (test_table이 없습니다. 테이블을 생성하거나 기존 테이블로 테스트하세요)')
        } else {
          throw error
        }
      } else {
        setDbStatus('success')
        setDbResult(`✅ 데이터베이스 연결 성공! ${data?.length || 0}개의 레코드를 찾았습니다.`)
      }
    } catch (error: any) {
      setDbStatus('error')
      setDbError(error.message || '데이터베이스 연결 실패')
      setDbResult('❌ 데이터베이스 연결 실패')
    }
  }

  // Storage 테스트
  const testStorage = async () => {
    setStorageStatus('testing')
    setStorageError('')
    setStorageResult('')

    try {
      // 버킷 목록 조회 테스트
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw bucketsError
      }

      if (buckets && buckets.length > 0) {
        setStorageStatus('success')
        setStorageResult(`✅ Storage 연결 성공! ${buckets.length}개의 버킷을 찾았습니다: ${buckets.map(b => b.name).join(', ')}`)
      } else {
        setStorageStatus('success')
        setStorageResult('✅ Storage 연결 성공! (버킷이 없습니다. Storage에서 버킷을 생성하세요)')
      }
    } catch (error: any) {
      setStorageStatus('error')
      setStorageError(error.message || 'Storage 연결 실패')
      setStorageResult('❌ Storage 연결 실패')
    }
  }

  // 파일 업로드 테스트
  const testFileUpload = async () => {
    setStorageStatus('testing')
    setStorageError('')
    setStorageResult('')

    try {
      // 테스트용 더미 파일 생성
      const testContent = `테스트 파일 생성 시간: ${new Date().toISOString()}`
      const testFile = new Blob([testContent], { type: 'text/plain' })
      const fileName = `test-${Date.now()}.txt`

      // 'test' 버킷에 업로드 시도 (버킷이 없으면 에러)
      const { data, error } = await supabase.storage
        .from('test')
        .upload(fileName, testFile)

      if (error) {
        if (error.message.includes('Bucket not found')) {
          setStorageStatus('success')
          setStorageResult('✅ Storage 연결 성공! (test 버킷이 없습니다. Storage에서 버킷을 생성하세요)')
        } else {
          throw error
        }
      } else {
        setStorageStatus('success')
        setStorageResult(`✅ 파일 업로드 성공! 파일명: ${fileName}`)
        
        // 업로드한 파일 삭제
        await supabase.storage.from('test').remove([fileName])
      }
    } catch (error: any) {
      setStorageStatus('error')
      setStorageError(error.message || '파일 업로드 실패')
      setStorageResult('❌ 파일 업로드 실패')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'testing':
        return <Badge variant="info" appearance="light">테스트 중...</Badge>
      case 'success':
        return <Badge variant="success" appearance="light">성공</Badge>
      case 'error':
        return <Badge variant="destructive" appearance="light">실패</Badge>
      default:
        return <Badge variant="mono" appearance="light">대기 중</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Supabase 연결 테스트
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            데이터베이스, Storage, 연결 상태를 확인할 수 있는 실험 페이지입니다
          </p>
        </div>

        {/* 환경 변수 확인 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              환경 변수 확인
            </CardTitle>
            <CardDescription>
              Supabase 연결에 필요한 환경 변수가 설정되어 있는지 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">NEXT_PUBLIC_SUPABASE_URL</span>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                <Badge variant="success" appearance="light">설정됨</Badge>
              ) : (
                <Badge variant="destructive" appearance="light">미설정</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <Badge variant="success" appearance="light">설정됨</Badge>
              ) : (
                <Badge variant="destructive" appearance="light">미설정</Badge>
              )}
            </div>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 연결 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              연결 테스트
            </CardTitle>
            <CardDescription>
              Supabase 서버와의 기본 연결을 확인합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(connectionStatus)}
                <span className="font-medium">연결 상태</span>
              </div>
              {getStatusBadge(connectionStatus)}
            </div>
            {connectionResult && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                {connectionResult}
              </div>
            )}
            {connectionError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-300">
                {connectionError}
              </div>
            )}
            <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
              {connectionStatus === 'testing' ? '테스트 중...' : '연결 테스트'}
            </Button>
          </CardContent>
        </Card>

        {/* 데이터베이스 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              데이터베이스 테스트
            </CardTitle>
            <CardDescription>
              PostgreSQL 데이터베이스 연결 및 쿼리 기능을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(dbStatus)}
                <span className="font-medium">데이터베이스 상태</span>
              </div>
              {getStatusBadge(dbStatus)}
            </div>
            {dbResult && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                {dbResult}
              </div>
            )}
            {dbError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-300">
                {dbError}
              </div>
            )}
            <Button onClick={testDatabase} disabled={dbStatus === 'testing'}>
              {dbStatus === 'testing' ? '테스트 중...' : '데이터베이스 테스트'}
            </Button>
          </CardContent>
        </Card>

        {/* Storage 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage 테스트
            </CardTitle>
            <CardDescription>
              Supabase Storage 연결 및 파일 업로드 기능을 테스트합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(storageStatus)}
                <span className="font-medium">Storage 상태</span>
              </div>
              {getStatusBadge(storageStatus)}
            </div>
            {storageResult && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                {storageResult}
              </div>
            )}
            {storageError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-800 dark:text-red-300">
                {storageError}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={testStorage} disabled={storageStatus === 'testing'}>
                {storageStatus === 'testing' ? '테스트 중...' : '버킷 목록 조회'}
              </Button>
              <Button onClick={testFileUpload} disabled={storageStatus === 'testing'} variant="outline">
                파일 업로드 테스트
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>사용 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• 각 테스트 버튼을 클릭하여 연결 상태를 확인할 수 있습니다.</p>
            <p>• 데이터베이스 테스트는 test_table이 없어도 연결은 확인됩니다.</p>
            <p>• Storage 테스트는 버킷이 없어도 연결은 확인됩니다.</p>
            <p>• 실제 테이블이나 버킷을 생성하려면 Supabase 대시보드를 사용하세요.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

