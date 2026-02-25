"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"
import { common, createLowlight } from "lowlight"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const lowlight = createLowlight(common)

interface AdvancedEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function AdvancedEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요... (이미지를 붙여넣거나 드래그하세요)",
  className
}: AdvancedEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false, // CodeBlockLowlight를 사용할 것이므로 비활성화
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto",
        },
      }),
      // 테이블 지원 (노션 복붙 시 테이블 구조 보존)
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: "border-collapse w-full my-4",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-50 px-4 py-2 font-semibold",
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[500px] p-6 prose prose-lg max-w-none [&_p]:mb-4 [&_p]:last:mb-0 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_strong]:font-bold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_hr]:my-8 [&_hr]:border-gray-300",
      },
      // 이미지 붙여넣기 핸들러
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          // 이미지 파일인 경우
          if (item.type.indexOf("image") === 0) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) {
              uploadImage(file)
            }
            return true
          }
        }
        return false
      },
      // 이미지 드롭 핸들러
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const files = event.dataTransfer.files
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.type.indexOf("image") === 0) {
              event.preventDefault()
              uploadImage(file)
              return true
            }
          }
        }
        return false
      },
    },
  })

  // 이미지 업로드 함수
  const uploadImage = async (file: File) => {
    if (!editor) return

    try {
      // 로딩 표시
      toast.loading("이미지 업로드 중...")

      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `archive-images/${fileName}`

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        throw error
      }

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath)

      // 에디터에 이미지 삽입
      editor.chain().focus().setImage({ src: publicUrl }).run()

      toast.success("이미지가 업로드되었습니다!")
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
      toast.error("이미지 업로드에 실패했습니다. Supabase Storage 설정을 확인하세요.")

      // 실패 시 Base64로 폴백
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          editor.chain().focus().setImage({ src: e.target.result as string }).run()
          toast.info("이미지를 로컬에서 표시합니다 (임시)")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 이미지 파일 선택 핸들러
  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        uploadImage(file)
      }
    }
    input.click()
  }

  // 링크 삽입 핸들러
  const handleLinkInsert = () => {
    const url = window.prompt("링크 URL을 입력하세요:")
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-white", className)}>
      {/* 툴바 */}
      <div className="border-b bg-gray-50 p-3 flex items-center gap-1 flex-wrap sticky top-0 z-10">
        {/* 텍스트 포맷 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("bold") && "bg-gray-200")}
          title="굵게 (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("italic") && "bg-gray-200")}
          title="기울임 (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("code") && "bg-gray-200")}
          title="인라인 코드"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 제목 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("h-9 w-9 p-0", editor.isActive("heading", { level: 1 }) && "bg-gray-200")}
          title="제목 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("h-9 w-9 p-0", editor.isActive("heading", { level: 2 }) && "bg-gray-200")}
          title="제목 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-9 w-9 p-0", editor.isActive("heading", { level: 3 }) && "bg-gray-200")}
          title="제목 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 리스트 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("bulletList") && "bg-gray-200")}
          title="글머리 기호 목록"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("orderedList") && "bg-gray-200")}
          title="번호 매기기 목록"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 블록 요소 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("blockquote") && "bg-gray-200")}
          title="인용구"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("h-9 w-9 p-0", editor.isActive("codeBlock") && "bg-gray-200")}
          title="코드 블록"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-9 w-9 p-0"
          title="구분선"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 이미지 & 링크 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
          className="h-9 w-9 p-0"
          title="이미지 업로드"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkInsert}
          className={cn("h-9 w-9 p-0", editor.isActive("link") && "bg-gray-200")}
          title="링크 삽입"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 실행 취소/다시 실행 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-9 w-9 p-0"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-9 w-9 p-0"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* 에디터 영역 */}
      <EditorContent
        editor={editor}
        className="min-h-[500px] max-h-[800px] overflow-y-auto"
      />
    </div>
  )
}
