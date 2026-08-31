/** @type {import('next').NextConfig} */
const nextConfig = {
  // 타입 에러를 무시하면 빌드가 통과해도 런타임에 터진다.
  // 2026-08-31 기준 tsc --noEmit 이 exit 0 이라 안전망을 켠 상태로 유지한다.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
