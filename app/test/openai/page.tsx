"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function OpenAITestPage() {
  const [prompt, setPrompt] = useState("Next.js 15의 새로운 기능들에 대해 간단히 설명해줘")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "valid" | "invalid" | "not-set">("checking")
  const [error, setError] = useState("")

  // 환경 변수 체크
  React.useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/openai/check")
        const data = await res.json()

        if (data.configured) {
          setApiKeyStatus("valid")
        } else {
          setApiKeyStatus("not-set")
        }
      } catch (err) {
        console.error("API Key 확인 실패:", err)
        setApiKeyStatus("invalid")
      }
    }

    checkApiKey()
  }, [])

  const handleTest = async () => {
    if (!prompt.trim()) {
      toast.error("프롬프트를 입력하세요")
      return
    }

    setIsLoading(true)
    setError("")
    setResponse("")

    try {
      const res = await fetch("/api/openai/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "OpenAI API 호출 실패")
      }

      setResponse(data.response)
      toast.success("OpenAI 응답을 받았습니다!")
    } catch (err: any) {
      console.error("OpenAI 테스트 실패:", err)
      setError(err.message)
      toast.error("OpenAI 테스트 실패: " + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // 템플릿 예시
  const templates = [
    {
      name: "기술 문서 초안",
      prompt: "Next.js 15의 새로운 기능들에 대해 기술 문서 스타일로 작성해줘. 주요 기능 3가지를 중심으로 설명해줘."
    },
    {
      name: "프로젝트 개요",
      prompt: "React와 TypeScript를 사용한 전자상거래 프로젝트의 개요를 작성해줘. 주요 기능, 기술 스택, 구현 포인트를 포함해줘."
    },
    {
      name: "요약 생성",
      prompt: "다음 기술을 한 문장으로 요약해줘: 'Supabase는 오픈소스 Firebase 대안으로, PostgreSQL 데이터베이스, 인증, 스토리지, 실시간 구독 기능을 제공합니다.'"
    },
    {
      name: "태그 제안",
      prompt: "Next.js 블로그 프로젝트에 적합한 태그 5개를 추천해줘"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">OpenAI API 테스트</h1>
          <p className="text-gray-600">
            OpenAI API가 정상적으로 작동하는지 테스트합니다
          </p>
        </div>

        {/* API 키 상태 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {apiKeyStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin" />}
              {apiKeyStatus === "valid" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {apiKeyStatus === "invalid" && <XCircle className="w-5 h-5 text-red-600" />}
              {apiKeyStatus === "not-set" && <AlertCircle className="w-5 h-5 text-yellow-600" />}
              API Key 상태
            </CardTitle>
            <CardDescription>
              {apiKeyStatus === "checking" && "환경 변수를 확인하는 중..."}
              {apiKeyStatus === "valid" && "✅ OpenAI API Key가 설정되어 있습니다"}
              {apiKeyStatus === "invalid" && "❌ API Key가 유효하지 않습니다"}
              {apiKeyStatus === "not-set" && "⚠️ API Key가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY를 추가하세요"}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 템플릿 예시 */}
        <Card>
          <CardHeader>
            <CardTitle>템플릿 예시</CardTitle>
            <CardDescription>
              자주 사용하는 프롬프트 템플릿을 선택하여 테스트할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setPrompt(template.prompt)}
                  className="justify-start h-auto py-3 px-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {template.prompt}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 프롬프트 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>프롬프트 입력</CardTitle>
            <CardDescription>
              OpenAI에게 요청할 내용을 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="프롬프트를 입력하세요..."
              rows={6}
              className="font-mono text-sm"
            />
            <Button
              onClick={handleTest}
              disabled={isLoading || apiKeyStatus !== "valid"}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  응답 대기 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  OpenAI 테스트 실행
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                에러 발생
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* 응답 결과 */}
        {response && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                OpenAI 응답
              </CardTitle>
              <CardDescription>
                API 호출이 성공했습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="bg-white rounded-lg p-4 text-sm whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 사용 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>사용 정보</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-gray-600">
            <p>• 모델: gpt-4o-mini (빠르고 저렴한 모델)</p>
            <p>• 최대 토큰: 500개</p>
            <p>• 온도: 0.7 (창의성 수준)</p>
            <p>• 요청 제한: 분당 10회 (OpenAI API 기본 제한)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
