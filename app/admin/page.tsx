"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Post = {
  id: string
  title: string
  category: string
  date: string
  status: "published" | "draft" | "archived"
  content?: string
}

const data: Post[] = [
  {
    id: "1",
    title: "ChatGPT 소개",
    category: "AI",
    date: "2024년 1월 15일",
    status: "published",
    content: "<p>ChatGPT는 OpenAI가 개발한 대규모 언어 모델입니다.</p>",
  },
  {
    id: "2",
    title: "AI의 미래",
    category: "Technology",
    date: "2024년 1월 10일",
    status: "published",
    content: "<p>인공지능 기술은 빠르게 발전하고 있습니다.</p>",
  },
  {
    id: "3",
    title: "머신러닝 기초",
    category: "AI",
    date: "2024년 1월 5일",
    status: "draft",
    content: "<p>머신러닝은 데이터로부터 학습하는 기술입니다.</p>",
  },
  {
    id: "4",
    title: "딥러닝 알고리즘",
    category: "Technology",
    date: "2023년 12월 20일",
    status: "published",
    content: "<p>딥러닝은 신경망을 활용한 학습 방법입니다.</p>",
  },
  {
    id: "5",
    title: "자연어 처리",
    category: "AI",
    date: "2023년 12월 15일",
    status: "archived",
    content: "<p>자연어 처리는 컴퓨터가 인간의 언어를 이해하는 기술입니다.</p>",
  },
]

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loginError, setLoginError] = React.useState("")
  const [posts, setPosts] = React.useState<Post[]>(data)
  const [editingPost, setEditingPost] = React.useState<Post | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState("")
  const [editCategory, setEditCategory] = React.useState("")
  const [editStatus, setEditStatus] = React.useState<"published" | "draft" | "archived">("draft")
  const [editContent, setEditContent] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    // 이메일이 "admin"이고 비밀번호가 "1234"인지 확인
    if (email === "admin" && password === "1234") {
      setIsLoggedIn(true)
      setLoginOpen(false)
      setEmail("")
      setPassword("")
    } else {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.")
    }
  }

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditCategory(post.category)
    setEditStatus(post.status)
    setEditContent(post.content || "")
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingPost) return

    const updatedPosts = posts.map((post) =>
      post.id === editingPost.id
        ? {
            ...post,
            title: editTitle,
            category: editCategory,
            status: editStatus,
            content: editContent,
          }
        : post
    )

    setPosts(updatedPosts)
    setEditDialogOpen(false)
    setEditingPost(null)
    setEditTitle("")
    setEditCategory("")
    setEditStatus("draft")
    setEditContent("")
  }

  const handleDelete = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    setPosts(updatedPosts)
  }

  const columns: ColumnDef<Post>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            제목
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({ row }) => <div className="capitalize">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "date",
      header: "날짜",
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                status === "published"
                  ? "bg-green-50 text-green-700"
                  : status === "draft"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-50 text-gray-700"
              }`}
            >
              {status === "published" ? "게시됨" : status === "draft" ? "초안" : "보관됨"}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>작업</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>ID 복사</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(post)}>수정</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(post.id)}>
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: posts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-semibold mb-4">관리자 페이지</h1>
          <p className="text-neutral-600 mb-8">로그인이 필요합니다.</p>
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button size="lg">로그인</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>관리자 로그인</DialogTitle>
                <DialogDescription>관리자 계정으로 로그인하여 블로그를 관리하세요.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input 
                    required 
                    id="email" 
                    type="text" 
                    autoComplete="username" 
                    placeholder="admin" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    required
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && (
                  <div className="text-sm text-red-600">{loginError}</div>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      취소
                    </Button>
                  </DialogClose>
                  <Button type="submit">로그인</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-4">
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold">포스트 관리</h1>
              <p className="text-neutral-600 mt-2">블로그 포스트를 관리하고 편집하세요.</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />새 포스트
            </Button>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="제목으로 검색..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto bg-transparent">
                  컬럼 <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      결과가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length}개 선택됨 (전체 {table.getFilteredRowModel().rows.length}
              개)
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                이전
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                다음
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>포스트 수정</DialogTitle>
            <DialogDescription>포스트 정보를 수정하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="포스트 제목"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">카테고리</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="카테고리"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">상태</Label>
              <Select value={editStatus} onValueChange={(value: "published" | "draft" | "archived") => setEditStatus(value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">게시됨</SelectItem>
                  <SelectItem value="draft">초안</SelectItem>
                  <SelectItem value="archived">보관됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">내용</Label>
              <RichTextEditor
                content={editContent}
                onChange={setEditContent}
                placeholder="포스트 내용을 입력하세요..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                취소
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveEdit}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
