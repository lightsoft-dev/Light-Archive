"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Sparkles, Trash2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedEditor } from "@/components/admin/advanced-editor"
import { TagInput } from "@/components/admin/tag-input"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { getArchiveById, updateArchive, deleteArchive } from "@/lib/supabase-archive"
import type { Archive } from "@/types/archive"

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<"기술" | "프로젝트">("기술")
  const [field, setField] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")

  // AI 초안 생성 관련 상태
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 아카이브 데이터 로드
  useEffect(() => {
    const loadArchive = async () => {
      setLoading(true)
      try {
        // Supabase에서 데이터 가져오기
        const archive = await getArchiveById(postId)

        if (!archive) {
          toast.error("아카이브를 찾을 수 없습니다")
          router.push("/admin")
          return
        }

        setTitle(archive.title)
        setCategory(archive.category === "프로젝트" ? "프로젝트" : "기술")
        setField(archive.sub_category || "")
        setLabels(archive.tags || [])
        setTechnologies(archive.technologies || [])
        setDifficulty(archive.difficulty || "")
        setContent(archive.content || "")
        setAuthor(archive.author || "")

        setLoading(false)
      } catch (error) {
        console.error("아카이브 로드 실패:", error)
        toast.error("아카이브를 불러오는데 실패했습니다")
        setLoading(false)
        router.push("/admin")
      }
    }

    loadArchive()
  }, [postId, router])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력하세요")
      return
    }

    if (!content.trim()) {
      toast.error("내용을 입력하세요")
      return
    }

    try {
      // Supabase에 업데이트
      const updates = {
        title,
        category,
        sub_category: field,
        tags: labels,
        technologies,
        difficulty,
        content,
        author,
      }

      const result = await updateArchive(postId, updates)

      if (result) {
        toast.success("아카이브가 저장되었습니다! 목록으로 이동합니다...")
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      } else {
        toast.error("저장에 실패했습니다")
      }
    } catch (error) {
      console.error("저장 실패:", error)
      toast.error("저장에 실패했습니다")
    }
  }

  const handleDelete = async () => {
    try {
      // Supabase에서 삭제
      const success = await deleteArchive(postId)

      if (success) {
        toast.success("아카이브가 삭제되었습니다! 목록으로 이동합니다...")
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      } else {
        toast.error("삭제에 실패했습니다")
      }
    } catch (error) {
      console.error("삭제 실패:", error)
      toast.error("삭제 중 오류가 발생했습니다")
    }
  }

  const handlePreview = () => {
    // TODO: 미리보기 기능 구현
    toast.info("미리보기 기능은 준비 중입니다")
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("초안 요청 내용을 입력하세요")
      return
    }

    setIsGenerating(true)
    try {
      // TODO: AI API 호출
      await new Promise(resolve => setTimeout(resolve, 2000))

      const generatedContent = `
<h1>${title || "제목을 입력하세요"}</h1>

<h2>📌 개요</h2>
<p>${aiPrompt}</p>

<h2>🎯 목적</h2>
<p>이 아카이브는 다음과 같은 목적으로 작성되었습니다:</p>
<ul>
  <li>핵심 개념 및 기술 이해</li>
  <li>실무 적용 가능한 지식 습득</li>
  <li>프로젝트 경험 공유</li>
</ul>

<h2>🔍 주요 내용</h2>
<h3>1. 배경</h3>
<p>프로젝트/기술의 배경을 설명합니다.</p>

<h3>2. 접근 방법</h3>
<p>어떤 방식으로 문제를 해결했는지 설명합니다.</p>

<h3>3. 구현 세부사항</h3>
<p>구체적인 구현 내용을 다룹니다.</p>

<h2>💡 핵심 포인트</h2>
<ul>
  <li>첫 번째 핵심 포인트</li>
  <li>두 번째 핵심 포인트</li>
  <li>세 번째 핵심 포인트</li>
</ul>

<h2>📊 결과 및 성과</h2>
<p>프로젝트의 결과와 성과를 정리합니다.</p>

<h2>🔚 결론</h2>
<p>프로젝트를 통해 얻은 인사이트와 향후 계획을 작성합니다.</p>
      `.trim()

      setContent(generatedContent)
      setAiDialogOpen(false)
      toast.success("AI 초안이 생성되었습니다! 내용을 확인하고 수정하세요.")
    } catch (error) {
      console.error("AI 생성 실패:", error)
      toast.error("AI 초안 생성에 실패했습니다")
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">아카이브를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold">아카이브 수정</h1>
              <p className="text-neutral-600 mt-2">
                기술 문서 또는 프로젝트 아카이브를 수정하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
              <Button variant="outline" onClick={handlePreview} className="gap-2">
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI 재작성
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                저장
              </Button>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                제목 <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                아카이브의 제목을 입력하세요. 명확하고 구체적인 제목이 좋습니다.
              </p>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: Next.js 15의 새로운 기능들"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-base font-semibold flex items-center gap-2">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-2">
                  기술 문서는 "기술", 프로젝트 사례는 "프로젝트"를 선택하세요.
                </p>
                <Select value={category} onValueChange={(value: "기술" | "프로젝트") => setCategory(value)}>
                  <SelectTrigger id="category" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="기술">기술</SelectItem>
                    <SelectItem value="프로젝트">프로젝트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field" className="text-base font-semibold">
                  분야
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-2">
                  예: web, 사내시스템, ai, 클로드 코드, 인공지능 활용 등
                </p>
                <Input
                  id="field"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="예: web"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">라벨 / 태그</Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                스페이스 키를 눌러 태그를 추가하세요. 자유롭게 입력 가능합니다.
              </p>
              <TagInput
                tags={labels}
                onChange={setLabels}
                placeholder="태그 입력 후 스페이스..."
              />
            </div>

            <div>
              <Label className="text-base font-semibold">사용 기술</Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                스페이스 키를 눌러 기술을 추가하세요. 예: React, TypeScript, Next.js
              </p>
              <TagInput
                tags={technologies}
                onChange={setTechnologies}
                placeholder="기술명 입력 후 스페이스..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty" className="text-base font-semibold">
                  난이도
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-2">
                  독자의 수준을 고려하여 난이도를 선택하세요.
                </p>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="mt-2">
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="초급">초급</SelectItem>
                    <SelectItem value="중급">중급</SelectItem>
                    <SelectItem value="고급">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author" className="text-base font-semibold">
                  작성자
                </Label>
                <p className="text-sm text-gray-500 mt-1 mb-2">
                  작성자 이름을 입력하세요 (선택사항)
                </p>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="작성자 이름"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <Label className="text-base font-semibold flex items-center gap-2">
              내용 <span className="text-red-500">*</span>
            </Label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2 mb-4">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">이미지 업로드 방법:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>스크린샷을 복사하고 <kbd className="px-1.5 py-0.5 bg-white rounded border">Ctrl+V</kbd> (또는 <kbd className="px-1.5 py-0.5 bg-white rounded border">Cmd+V</kbd>) 로 붙여넣기</li>
                    <li>이미지 파일을 에디터에 드래그 앤 드롭</li>
                    <li>툴바의 이미지 아이콘을 클릭하여 파일 선택</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    📁 <strong>저장 위치:</strong> Supabase Storage → <code className="bg-white px-1 rounded">thumbnails</code> 버킷 → <code className="bg-white px-1 rounded">archive-images/</code> 폴더
                  </p>
                </div>
              </div>
            </div>
            <AdvancedEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>

      {/* AI 초안 생성 다이얼로그 */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI 재작성
            </DialogTitle>
            <DialogDescription>
              현재 내용을 기반으로 AI가 기획서 스타일로 재작성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ai-prompt">
                어떤 방향으로 재작성하고 싶나요?
              </Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="예: 더 기술적인 내용을 추가하고, 실습 예제를 포함시켜주세요."
                rows={6}
                className="mt-2"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>⚠️ 주의:</strong> 재작성하면 현재 내용이 완전히 대체됩니다. 필요하다면 먼저 저장하세요.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAiDialogOpen(false)}
              disabled={isGenerating}
            >
              취소
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>생성 중...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  재작성
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 아카이브가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
