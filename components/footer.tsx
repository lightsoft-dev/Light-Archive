export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-card-foreground">Archive</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              생각과 경험을 기록하고 공유하는 개인 블로그입니다.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">탐색</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="transition-colors hover:text-card-foreground">
                  홈
                </a>
              </li>
              <li>
                <a href="/about" className="transition-colors hover:text-card-foreground">
                  소개
                </a>
              </li>
              <li>
                <a href="/categories" className="transition-colors hover:text-card-foreground">
                  카테고리
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">연결</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com" className="transition-colors hover:text-card-foreground">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com" className="transition-colors hover:text-card-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="mailto:hello@example.com" className="transition-colors hover:text-card-foreground">
                  Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Archive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
