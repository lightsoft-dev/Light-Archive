import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ArchiveCardProps {
  id: number
  date: string
  category: string
  title: string
  excerpt: string
  readTime: string
}

export function ArchiveCard({ id, date, category, title, excerpt, readTime }: ArchiveCardProps) {
  return (
    <Link
      href={`/post/${id}`}
      className="group block rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
    >
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <time>{date}</time>
        <span>·</span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground">
          {category}
        </span>
        <span>·</span>
        <span>{readTime} 읽기</span>
      </div>

      <h3 className="mb-2 text-balance text-xl font-semibold tracking-tight text-card-foreground transition-colors group-hover:text-accent">
        {title}
      </h3>

      <p className="mb-4 text-pretty leading-relaxed text-muted-foreground">{excerpt}</p>

      <div className="flex items-center gap-2 text-sm font-medium text-accent">
        <span>더 읽기</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
