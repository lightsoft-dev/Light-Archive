/**
 * skills.sh 설치수 조회 (서버 전용)
 *
 * 공개 스킬이 실제로 얼마나 쓰이는지는 skills.sh 가 안다. 그 숫자를 카탈로그에 끌어와
 * "많이 쓰이는 순"으로 볼 수 있게 한다.
 *
 * 공개 API 가 따로 문서화돼 있지 않아 검색 엔드포인트를 쓴다(2026-08 실측):
 *   GET https://www.skills.sh/api/search?q=<query>
 *   → { skills: [{ id, skillId, name, installs, source }] }
 * `source` 가 `owner/repo` 라서 그걸로 우리 스킬을 골라낸다.
 *
 * 외부 비공식 경로이므로 **실패하면 조용히 null 을 준다.** 설치수는 있으면 좋은 정보이지
 * 목록이 떠야 하는 이유가 아니다 — 여기서 예외가 나서 카탈로그가 안 뜨면 본말전도다.
 */

const SEARCH_ENDPOINT = "https://www.skills.sh/api/search"
const CACHE_MS = 60 * 60 * 1000 // 1시간
const TIMEOUT_MS = 5000

/**
 * 프로세스 메모리 캐시.
 *
 * 처음에는 fetch 의 `next: { revalidate }` 를 썼는데 **실측하니 캐시가 안 됐다** —
 * 이 API 는 `cookies()` 로 세션을 보기 때문에 동적 렌더링이고, 그 컨텍스트의 fetch 는
 * 데이터 캐시를 타지 않는다. 요청 5회에 외부 호출이 10회 그대로 나갔다.
 *
 * 그래서 캐시를 직접 들고 있는다. 서버리스라 인스턴스가 바뀌면 비지만,
 * Fluid Compute 는 인스턴스를 재사용하므로 대부분의 요청이 여기서 끝난다.
 * 설치수는 실시간일 필요가 없다.
 */
const memo = new Map<string, { value: number | null; expiresAt: number }>()

interface SearchHit {
  name?: string
  source?: string
  installs?: number
}

/**
 * `owner/repo` 저장소의 특정 스킬 설치수.
 * 아직 색인되지 않았거나(공개 직후) 조회에 실패하면 null.
 */
export async function fetchInstallCount(repo: string, skillName: string): Promise<number | null> {
  const key = `${repo}@${skillName}`
  const cached = memo.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.value

  let value: number | null = null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(skillName)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
    clearTimeout(timer)

    if (res.ok) {
      const body = (await res.json()) as { skills?: SearchHit[] }
      const hit = (body.skills || []).find(
        (s) => s.source?.toLowerCase() === repo.toLowerCase() && s.name === skillName
      )
      if (typeof hit?.installs === "number") value = hit.installs
    }
  } catch {
    // 타임아웃·네트워크 오류·형식 변경 — 전부 "모름"으로 처리한다
    value = null
  }

  // 실패도 캐시한다. 아직 색인되지 않은 스킬을 매 요청마다 다시 물어볼 이유가 없다.
  memo.set(key, { value, expiresAt: Date.now() + CACHE_MS })
  return value
}

/** 여러 스킬의 설치수를 병렬로. 실패한 것은 null 로 남는다 */
export async function fetchInstallCounts(
  items: { repo: string; skillName: string }[]
): Promise<Map<string, number>> {
  const results = await Promise.all(
    items.map(async ({ repo, skillName }) => ({
      key: `${repo}@${skillName}`,
      installs: await fetchInstallCount(repo, skillName),
    }))
  )

  const map = new Map<string, number>()
  for (const r of results) {
    if (r.installs !== null) map.set(r.key, r.installs)
  }
  return map
}
