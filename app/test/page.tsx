'use client'

import { useState } from 'react'
import { supabase, supabaseUrl } from '@/lib/supabase'
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
      // 방법 1: Supabase REST API health check를 직접 호출
      const currentUrl = supabaseUrl
      const currentKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      const healthCheckUrl = `${currentUrl}/rest/v1/`
      
      const healthResponse = await fetch(healthCheckUrl, {
        method: 'GET',
        headers: {
          'apikey': currentKey,
          'Authorization': `Bearer ${currentKey}`
        }
      })

      // HTTP 상태 코드 확인
      if (healthResponse.ok || healthResponse.status === 404 || healthResponse.status === 406) {
        // 404나 406도 정상 (엔드포인트가 없어도 서버는 응답함)
        setConnectionStatus('success')
        setConnectionResult('✅ Supabase 연결 성공! 서버가 정상적으로 응답했습니다.')
        return
      }

      // 방법 2: 존재하지 않는 테이블 쿼리 (연결 테스트용)
      const { data, error } = await supabase.from('_connection_test_table_that_does_not_exist').select('*').limit(0)
      
      if (error) {
        // 테이블이 없어도 연결은 정상 - 다양한 에러 메시지 패턴 확인
        const isTableNotFoundError = 
          error.code === 'PGRST116' || 
          error.message.includes('relation') || 
          error.message.includes('does not exist') ||
          error.message.includes('Could not find') ||
          error.message.includes('schema cache') ||
          error.message.includes('not found')

        if (isTableNotFoundError) {
          setConnectionStatus('success')
          setConnectionResult('✅ Supabase 연결 성공! (테이블이 없어도 연결은 정상입니다)')
        } else {
          // 네트워크 오류나 인증 오류인 경우
          throw error
        }
      } else {
        setConnectionStatus('success')
        setConnectionResult('✅ Supabase 연결 성공!')
      }
    } catch (error: any) {
      setConnectionStatus('error')
      const errorMessage = error.message || '연결 실패'
      setConnectionError(errorMessage)
      
      // 구체적인 오류 메시지 제공
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setConnectionResult('❌ 연결 실패: 네트워크 오류 또는 URL이 잘못되었습니다.')
      } else if (errorMessage.includes('JWT') || errorMessage.includes('Invalid API key')) {
        setConnectionResult('❌ 연결 실패: API Key가 잘못되었습니다.')
      } else {
        setConnectionResult(`❌ 연결 실패: ${errorMessage}`)
      }
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
  const testStorage = async (bucketName: string = 'test') => {
    setStorageStatus('testing')
    setStorageError('')
    setStorageResult('')

    try {
      // 지정된 버킷에 직접 접근하여 연결 확인
      // 버킷 목록 조회는 관리자 권한이 필요할 수 있으므로 특정 버킷에 직접 접근
      const { data: files, error: filesError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 })

      if (filesError) {
        // 에러 타입별 처리
        if (filesError.message.includes('Bucket not found') ||
            filesError.message.includes('not found') ||
            filesError.message.includes('does not exist')) {
          setStorageStatus('success')
          setStorageResult(`✅ Storage 연결 성공! (${bucketName} 버킷이 없습니다. Storage에서 버킷을 생성하세요)`)
        } else if (filesError.message.includes('new row violates row-level security') ||
                   filesError.message.includes('RLS') ||
                   filesError.message.includes('permission denied') ||
                   filesError.message.includes('권한')) {
          setStorageStatus('error')
          setStorageError('권한 오류: Storage RLS 정책을 확인하세요')
          setStorageResult(`❌ Storage 연결 실패: RLS 정책으로 인해 접근이 거부되었습니다. ${bucketName} 버킷의 RLS 정책을 확인하세요.`)
        } else {
          throw filesError
        }
      } else {
        // 성공: 버킷에 접근 가능
        const fileCount = files?.length || 0
        setStorageStatus('success')
        setStorageResult(`✅ Storage 연결 성공! (${bucketName} 버킷에 접근 가능합니다${fileCount > 0 ? `, ${fileCount}개의 파일/폴더가 있습니다` : ''})`)
      }
    } catch (error: any) {
      setStorageStatus('error')
      const errorMessage = error.message || 'Storage 연결 실패'
      setStorageError(errorMessage)
      
      if (errorMessage.includes('RLS') || errorMessage.includes('row-level security')) {
        setStorageResult('❌ Storage 연결 실패: RLS 정책으로 인해 접근이 거부되었습니다')
      } else if (errorMessage.includes('permission') || errorMessage.includes('권한')) {
        setStorageResult('❌ Storage 연결 실패: 권한이 없습니다. Storage RLS 정책을 확인하세요')
      } else {
        setStorageResult(`❌ Storage 연결 실패: ${errorMessage}`)
      }
    }
  }

  // 파일 업로드 테스트
  const testFileUpload = async (bucketName: string = 'test') => {
    setStorageStatus('testing')
    setStorageError('')
    setStorageResult('')

    try {
      // 테스트용 더미 파일 생성
      const testContent = `테스트 파일 생성 시간: ${new Date().toISOString()}`
      const testFile = new Blob([testContent], { type: 'text/plain' })
      const fileName = `test-${Date.now()}.txt`

      // 지정된 버킷에 업로드 시도
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, testFile)

      if (error) {
        // 에러 타입별 처리
        if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
          setStorageStatus('error')
          setStorageError(`${bucketName} 버킷을 찾을 수 없습니다`)
          setStorageResult(`❌ 파일 업로드 실패: ${bucketName} 버킷이 없습니다. Supabase 대시보드에서 버킷을 생성하세요.`)
        } else if (error.message.includes('new row violates row-level security') ||
                   error.message.includes('RLS') ||
                   error.message.includes('permission denied') ||
                   error.message.includes('권한')) {
          setStorageStatus('error')
          setStorageError('권한 오류: Storage RLS 정책을 확인하세요')
          setStorageResult(`❌ 파일 업로드 실패: RLS 정책으로 인해 업로드가 거부되었습니다. ${bucketName} 버킷의 RLS 정책을 확인하세요.`)
        } else if (error.message.includes('already exists')) {
          // 파일이 이미 존재하는 경우 (재시도)
          const retryFileName = `test-retry-${Date.now()}.txt`
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucketName)
            .upload(retryFileName, testFile)

          if (retryError) {
            throw retryError
          } else {
            setStorageStatus('success')
            setStorageResult(`✅ 파일 업로드 성공! 파일명: ${retryFileName}`)
            await supabase.storage.from(bucketName).remove([retryFileName])
          }
        } else {
          throw error
        }
      } else {
        setStorageStatus('success')
        setStorageResult(`✅ 파일 업로드 성공! 파일명: ${fileName}`)

        // 업로드한 파일 삭제 (정리)
        try {
          await supabase.storage.from(bucketName).remove([fileName])
          setStorageResult(`✅ 파일 업로드 성공! 파일명: ${fileName} (테스트 파일은 자동으로 삭제되었습니다)`)
        } catch (deleteError) {
          // 삭제 실패는 무시 (업로드는 성공했으므로)
          console.warn('테스트 파일 삭제 실패:', deleteError)
        }
      }
    } catch (error: any) {
      setStorageStatus('error')
      const errorMessage = error.message || '파일 업로드 실패'
      setStorageError(errorMessage)
      
      if (errorMessage.includes('RLS') || errorMessage.includes('row-level security')) {
        setStorageResult('❌ 파일 업로드 실패: RLS 정책으로 인해 업로드가 거부되었습니다')
      } else if (errorMessage.includes('permission') || errorMessage.includes('권한')) {
        setStorageResult('❌ 파일 업로드 실패: 권한이 없습니다. Storage RLS 정책을 확인하세요')
      } else {
        setStorageResult(`❌ 파일 업로드 실패: ${errorMessage}`)
      }
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
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">NEXT_PUBLIC_SUPABASE_URL</span>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <Badge variant="success" appearance="light">설정됨</Badge>
                ) : (
                  <Badge variant="destructive" appearance="light">미설정</Badge>
                )}
              </div>
              {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all pl-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <Badge variant="success" appearance="light">설정됨</Badge>
                ) : (
                  <Badge variant="destructive" appearance="light">미설정</Badge>
                )}
              </div>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && (
                <div className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all pl-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...
                </div>
              )}
            </div>
            <div className="space-y-1 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Supabase 클라이언트 URL</span>
                <Badge variant="mono" appearance="light">실제 사용값</Badge>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 font-mono break-all pl-2">
                {supabaseUrl}
              </div>
            </div>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하고 개발 서버를 재시작하세요.
                  </div>
                </div>
              </div>
            )}
            {process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy') && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    더미 URL이 사용되고 있습니다. .env.local 파일에 실제 Supabase URL을 설정하세요.
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
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>test 버킷</strong> 테스트 (개발용)
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => testStorage('test')} disabled={storageStatus === 'testing'}>
                    {storageStatus === 'testing' ? '테스트 중...' : 'test 버킷 연결'}
                  </Button>
                  <Button onClick={() => testFileUpload('test')} disabled={storageStatus === 'testing'} variant="outline">
                    test 버킷 업로드
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <strong>thumbnails 버킷</strong> 테스트 (Admin 에디터용)
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => testStorage('thumbnails')} disabled={storageStatus === 'testing'}>
                    {storageStatus === 'testing' ? '테스트 중...' : 'thumbnails 버킷 연결'}
                  </Button>
                  <Button onClick={() => testFileUpload('thumbnails')} disabled={storageStatus === 'testing'} variant="outline">
                    thumbnails 버킷 업로드
                  </Button>
                </div>
              </div>
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
            <p>• <strong>thumbnails 버킷</strong>은 Admin 에디터에서 이미지 업로드에 사용됩니다.</p>
            <p>• RLS 에러가 발생하면 <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">docs/admin-storage-rls-guide.md</code>를 참고하세요.</p>
            <p>• 실제 테이블이나 버킷을 생성하려면 Supabase 대시보드를 사용하세요.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

