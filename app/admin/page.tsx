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
import { useRouter } from "next/navigation"

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

import { mockProjects } from "@/components/mock/projects"
import { mockSkills } from "@/components/mock/skills"
import type { Archive } from "@/types/archive"

export default function AdminPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [loginOpen, setLoginOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loginError, setLoginError] = React.useState("")

  // Projects와 Skills를 통합
  const allArchives: Archive[] = [...mockProjects, ...mockSkills]
  const [archives, setArchives] = React.useState<Archive[]>(allArchives)
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

  const handleEdit = (archive: Archive) => {
    // 수정 페이지로 이동
    router.push(`/admin/edit/${archive.id}`)
  }

  const handleDelete = (archiveId: string) => {
    const updatedArchives = archives.filter((archive) => archive.id !== archiveId)
    setArchives(updatedArchives)
  }

  const columns: ColumnDef<Archive>[] = [
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
      cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.getValue("category") === "프로젝트"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
          }`}>
            {row.getValue("category")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "subCategory",
      header: "분야",
      cell: ({ row }) => {
        const subCategory = row.getValue("subCategory") as string | undefined
        return <div className="text-sm text-gray-600">{subCategory || "-"}</div>
      },
    },
    {
      accessorKey: "tags",
      header: "태그",
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string[] | undefined
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags && tags.length > 0 ? (
              tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
            {tags && tags.length > 2 && (
              <span className="text-xs text-gray-500">+{tags.length - 2}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "difficulty",
      header: "난이도",
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string | undefined
        return <div className="text-sm">{difficulty || "-"}</div>
      },
    },
    {
      accessorKey: "viewCount",
      header: "조회",
      cell: ({ row }) => {
        const viewCount = row.getValue("viewCount") as number | undefined
        return <div className="text-sm text-gray-600">{viewCount !== undefined ? viewCount.toLocaleString() : "-"}</div>
      },
    },
    {
      accessorKey: "date",
      header: "날짜",
      cell: ({ row }) => <div className="text-sm text-gray-600">{row.getValue("date") || "-"}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const archive = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(archive.id)}>ID 복사</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEdit(archive)}>수정</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(archive.id)}>
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: archives,
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
            <Link href="/admin/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />새 포스트
              </Button>
            </Link>
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

    </div>
  )
}
