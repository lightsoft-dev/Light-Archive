import { ArchiveCard } from "@/components/archive-card"
import { mockArchiveList } from "@/components/mock/archive-list"

export function ArchiveList() {
  return (
    <section className="container mx-auto max-w-4xl px-6 pb-24">
      <div className="mb-12">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">최근 글</h2>
        <p className="text-sm text-muted-foreground">생각과 경험을 기록합니다</p>
      </div>

      <div className="space-y-6">
        {mockArchiveList.map((post) => (
          <ArchiveCard key={post.id} {...post} />
        ))}
      </div>
    </section>
  )
}
