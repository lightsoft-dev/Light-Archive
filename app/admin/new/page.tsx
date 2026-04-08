"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Sparkles, Info, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedEditor } from "@/components/admin/advanced-editor"
import { TagInput } from "@/components/admin/tag-input"
import { toast } from "sonner"
import { createArchive } from "@/lib/supabase-archive"
import { FileAttachment } from "@/components/admin/file-attachment"
import type { Attachment } from "@/types/archive"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<"기술" | "프로젝트">("기술")
  const [field, setField] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState("")
  const [githubUrl, setGithubUrl] = useState("")

  // 첨부파일 관련 상태
  const [archiveId] = useState(() => `${Date.now()}-${Math.random().toString(36).substring(7)}`)
  const [attachments, setAttachments] = useState<Attachment[]>([])

  // AI 초안 생성 관련 상태
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSave = async (asDraft: boolean = false) => {
    if (!title.trim()) {
      toast.error("제목을 입력하세요")
      return
    }

    if (!asDraft && !content.trim()) {
      toast.error("내용을 입력하세요")
      return
    }

    try {
      // Supabase에 저장 (첨부파일 업로드 시 사용한 ID와 동일)
      const archiveData = {
        id: archiveId,
        title,
        category,
        sub_category: field,
        tags: labels,
        technologies,
        difficulty,
        content,
        author,
        github_url: githubUrl || undefined,
        date: new Date().toLocaleDateString("ko-KR"),
        status: asDraft ? "draft" as const : "published" as const,
      }

      const result = await createArchive(archiveData)

      if (result) {
        toast.success(asDraft ? "임시저장되었습니다! 목록으로 이동합니다..." : "아카이브가 저장되었습니다! 목록으로 이동합니다...")

        // 목록으로 이동
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
      // 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 기획서 스타일 템플릿
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
              <h1 className="text-2xl md:text-4xl font-semibold">새 아카이브 작성</h1>
              <p className="text-neutral-600 mt-2">
                기술 문서 또는 프로젝트 아카이브를 작성하세요
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handlePreview} className="gap-2">
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
              <Button variant="outline" onClick={() => setAiDialogOpen(true)} className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI 초안 생성
              </Button>
              <Button variant="outline" onClick={() => handleSave(true)} className="gap-2">
                <FileText className="w-4 h-4" />
                임시저장
              </Button>
              <Button onClick={() => handleSave(false)} className="gap-2">
                <Save className="w-4 h-4" />
                발행
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="github-url" className="text-base font-semibold">
                GitHub URL
              </Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">
                관련 GitHub 저장소 링크를 입력하세요 (선택사항)
              </p>
              <Input
                id="github-url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-2"
              />
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

          {/* 첨부파일 */}
          <div className="border-t pt-6">
            <Label className="text-base font-semibold flex items-center gap-2">
              첨부파일
            </Label>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              PDF, 문서, 이미지 등 파일을 첨부할 수 있습니다. 방문자가 다운로드할 수 있습니다.
            </p>
            <FileAttachment
              archiveId={archiveId}
              attachments={attachments}
              onChange={setAttachments}
            />
          </div>
        </div>
      </div>

      {/* AI 초안 생성 다이얼로그 */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI 초안 생성
            </DialogTitle>
            <DialogDescription>
              작성하고 싶은 내용을 간단히 설명하면 AI가 기획서 스타일로 초안을 생성합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ai-prompt">
                어떤 내용을 작성하고 싶나요?
              </Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="예: Next.js 15의 새로운 기능들과 성능 개선 사항에 대해 작성하고 싶습니다. 특히 Server Components와 Turbopack의 개선사항을 중점적으로 다루고 싶습니다."
                rows={6}
                className="mt-2"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 팁:</strong> 제목과 카테고리를 먼저 입력하면 더 맥락에 맞는 초안을 생성할 수 있습니다.
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
                  초안 생성
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
