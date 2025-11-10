"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter, Github } from "lucide-react"

function Footerdemo() {
  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Newsletter Section */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Light Archive</h2>
            <p className="mb-6 text-muted-foreground">
              AI 기반 기술/프로젝트 아카이브 플랫폼. 최신 기술 동향과 프로젝트 인사이트를 받아보세요.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="이메일을 입력하세요"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">구독하기</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">카테고리</h3>
            <nav className="space-y-2 text-sm">
              <a href="/" className="block transition-colors hover:text-primary">
                전체
              </a>
              <a href="/?category=tech" className="block transition-colors hover:text-primary">
                기술
              </a>
              <a href="/?category=project" className="block transition-colors hover:text-primary">
                프로젝트
              </a>
              <a href="/?category=research" className="block transition-colors hover:text-primary">
                리서치
              </a>
              <a href="/?category=news" className="block transition-colors hover:text-primary">
                뉴스
              </a>
            </nav>
          </div>

          {/* Social Media */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">소셜 미디어</h3>
            <div className="flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('https://github.com/lightsoft-dev', '_blank')}
                    >
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub에서 팔로우하기</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('https://www.instagram.com/lightsoft_crew/', '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram에서 팔로우하기</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      onClick={() => window.open('https://www.threads.com/@lightsoft_crew', '_blank')}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.924-10.935 21.341-10.935h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.141-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.483-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.691 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.552ZM98.44 129.507c-9.983.577-21.735-3.568-21.735-13.994 0-8.907 7.779-15.667 18.445-16.028 1.43-.047 2.828-.068 4.189-.068 8.018 0 15.316.824 21.74 2.457-2.979 24.159-13.638 27.053-22.639 27.633Z" />
                      </svg>
                      <span className="sr-only">Threads</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Threads에서 팔로우하기</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Light Archive. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="/privacy" className="transition-colors hover:text-primary">
              개인정보처리방침
            </a>
            <a href="/terms" className="transition-colors hover:text-primary">
              이용약관
            </a>
            <a href="/cookies" className="transition-colors hover:text-primary">
              쿠키 정책
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
