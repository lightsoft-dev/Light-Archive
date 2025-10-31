"use client"

import Link from "next/link"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { mockNavItems } from "@/components/mock/nav-items"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
}

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  return (
    <>
      {/* Toggle button when sidebar is closed (desktop only) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-50 hidden lg:flex p-2 hover:bg-gray-100/50 rounded-md transition-colors bg-white/40 backdrop-blur-xl"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 z-40
          bg-white/40 backdrop-blur-2xl
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/가로logo.png" alt="Lightsoft" className="h-16" />
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={onToggle} className="hidden lg:flex p-2 hover:bg-gray-100/50 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100/50 rounded-md transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="space-y-1">
            {mockNavItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && (
                  <div className="px-3 py-2 text-sm font-medium text-gray-900">{section.title}</div>
                )}
                {section.items.map((item, itemIndex) => {
                  const hasChildren = item.children && item.children.length > 0
                  const isProject = item.id === "project"
                  const isTechnology = item.id === "technology"
                  const previousItem = section.items[itemIndex - 1]
                  const shouldAddSpacing = (isTechnology && previousItem?.id === "home") || (isProject && previousItem?.id === "technology")

                  return (
                    <div key={item.id} className={shouldAddSpacing ? "mt-4" : ""}>
                      {hasChildren ? (
                        <>
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
                              {item.label}
                            </div>
                          )}
                          <div className="ml-4 mt-1 space-y-0">
                            {item.children?.map((child) =>
                              child.href ? (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  className="block px-3 py-2 text-sm text-gray-500 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ) : (
                                <div
                                  key={child.id}
                                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
                                >
                                  {child.label}
                                </div>
                              )
                            )}
                          </div>
                        </>
                      ) : item.href ? (
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100/50 rounded-md cursor-pointer transition-colors">
                          {item.label}
                        </div>
                      )}
                    </div>
                  )
                })}
                {sectionIndex < mockNavItems.length - 1 && <div className="pt-4" />}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
