"use client"

import { Search, Menu } from "lucide-react"

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="bg-white/40 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4 px-8 py-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100/50 rounded-md transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100/50 rounded-md transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
