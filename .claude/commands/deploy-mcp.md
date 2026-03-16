---
description: Light Archive MCP 서버를 Cloudflare Workers에 배포
---

# Deploy MCP to Cloudflare Workers

1. `light-archive-mcp-cf/` 디렉토리로 이동
2. `npx wrangler whoami`로 로그인 확인 (미로그인 시 `npx wrangler login`)
3. `npx wrangler deploy`로 배포
4. 배포 URL 확인 후 `curl`로 루트 엔드포인트 테스트
5. 결과 요약: 배포 URL, 버전 ID, MCP 엔드포인트 안내
