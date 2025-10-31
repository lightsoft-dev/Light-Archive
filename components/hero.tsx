export function Hero() {
  return (
    <section className="container mx-auto max-w-4xl px-6 py-24 md:py-32">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5">
          <span className="text-xs font-medium text-secondary-foreground">2024년 10월 31일</span>
        </div>

        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
          생각의 기록
        </h1>

        <p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          일상의 순간들과 배움을 기록하는 공간입니다. 깊이 있는 생각과 경험을 나누며 함께 성장합니다.
        </p>
      </div>
    </section>
  )
}
