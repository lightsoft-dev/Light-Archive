# SEO 체크리스트

Light Archive 프로젝트의 SEO 최적화 현황 및 체크리스트입니다.

## ✅ 완료된 항목

### 1. 메타데이터 설정

#### 루트 Layout (`app/layout.tsx`)
- ✅ 기본 제목 및 템플릿 설정
- ✅ 상세한 설명 (description)
- ✅ 키워드 (keywords) 배열
- ✅ 작성자 및 발행자 정보
- ✅ Open Graph 메타데이터
  - type, locale, url, siteName
  - 이미지 (1200x630)
- ✅ Twitter Card 메타데이터
- ✅ Robots 설정 (index, follow)
- ✅ 파비콘 및 아이콘
- ✅ Web Manifest
- ✅ Canonical URL
- ✅ metadataBase 설정

#### 페이지별 Layout
- ✅ `/projects/layout.tsx` - 프로젝트 페이지 메타데이터
- ✅ `/skills/layout.tsx` - 기술 페이지 메타데이터
- ✅ `/admin/layout.tsx` - 관리자 페이지 (noindex 설정)

### 2. 검색 엔진 최적화

#### Robots.txt (`app/robots.ts`)
- ✅ Allow/Disallow 규칙 설정
- ✅ Sitemap 위치 지정
- ✅ 관리자 페이지 크롤링 차단

#### Sitemap (`app/sitemap.ts`)
- ✅ 정적 페이지 포함
- ✅ 우선순위 설정
- ✅ 변경 빈도 설정
- ⏳ 동적 페이지 추가 (TODO: Supabase 연동 후)

### 3. 소셜 미디어 최적화

#### Open Graph Image
- ✅ 동적 OG 이미지 생성 (`app/opengraph-image.tsx`)
- ✅ 1200x630 크기
- ✅ Edge Runtime 사용

#### 기타 파일
- ✅ `site.webmanifest` - PWA 매니페스트
- ✅ `browserconfig.xml` - Windows 타일 설정

### 4. 구조화된 데이터 (JSON-LD)

#### Schema.org 마크업
- ✅ WebSite 스키마
- ✅ Organization 스키마
- ✅ Article 스키마 (컴포넌트 준비)
- ✅ SearchAction 추가

## ⏳ 추가 작업 필요

### 1. 동적 페이지 메타데이터

#### 프로젝트 상세 페이지 (`/projects/[id]`)
```typescript
// TODO: generateMetadata 함수 추가
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.id)
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      images: [project.image],
    },
  }
}
```

#### 기술 상세 페이지 (`/skills/[id]`)
```typescript
// TODO: generateMetadata 함수 추가
```

### 2. 동적 Sitemap

```typescript
// app/sitemap.ts
const projects = await getProjects()
const skills = await getSkills()

const projectPages = projects.map((project) => ({
  url: `${baseUrl}/projects/${project.id}`,
  lastModified: new Date(project.updated_at),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}))

const skillPages = skills.map((skill) => ({
  url: `${baseUrl}/skills/${skill.id}`,
  lastModified: new Date(skill.updated_at),
  changeFrequency: 'weekly' as const,
  priority: 0.8,
}))

return [...staticPages, ...projectPages, ...skillPages]
```

### 3. 추가 파일

#### Favicon 이미지
현재 코드에서 참조하는 파일들을 실제로 생성해야 합니다:
- `/public/favicon.ico`
- `/public/favicon-16x16.png`
- `/public/apple-touch-icon.png`
- `/public/android-chrome-192x192.png`
- `/public/android-chrome-512x512.png`
- `/public/og-image.jpg` (또는 동적 생성 사용)

**생성 방법:**
1. [Favicon Generator](https://realfavicongenerator.net/) 사용
2. 로고 이미지 업로드
3. 생성된 파일들을 `/public` 폴더에 저장

### 4. 성능 최적화

- ⏳ 이미지 최적화 (WebP 형식)
- ⏳ 지연 로딩 (Lazy Loading)
- ⏳ Core Web Vitals 개선
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)

### 5. 접근성 (A11y)

- ⏳ Alt 텍스트 검증
- ⏳ ARIA 레이블 추가
- ⏳ 키보드 네비게이션 테스트
- ⏳ 색상 대비 검증

## 📊 SEO 테스트 도구

개발 후 다음 도구로 검증하세요:

### 1. Google 도구
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### 2. 기타 도구
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)
- [Ahrefs](https://ahrefs.com/) 또는 [SEMrush](https://www.semrush.com/)

### 3. 메타데이터 검증
- [Meta Tags](https://metatags.io/)
- [OpenGraph Preview](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 🚀 배포 전 체크리스트

- [ ] `metadataBase` URL을 실제 도메인으로 변경
- [ ] Open Graph 이미지 확인
- [ ] Sitemap 동적 생성 구현
- [ ] 모든 페이지 메타데이터 확인
- [ ] 파비콘 파일 생성 및 배치
- [ ] Robots.txt 테스트
- [ ] Canonical URL 확인
- [ ] 404 페이지 메타데이터
- [ ] Google Analytics 설정 (필요 시)
- [ ] Google Search Console 등록

## 📈 SEO 모니터링

배포 후 주기적으로 확인할 항목:

1. **주간 체크**
   - Google Search Console에서 색인 상태 확인
   - 검색 쿼리 및 클릭률 모니터링
   - Core Web Vitals 확인

2. **월간 체크**
   - 백링크 상태
   - 경쟁사 분석
   - 키워드 순위 추적

3. **분기별 체크**
   - SEO 전략 재검토
   - 콘텐츠 업데이트 계획
   - 기술적 SEO 감사

## 💡 추가 권장 사항

### 1. 콘텐츠 최적화
- 각 페이지마다 고유한 제목과 설명
- 키워드 밀도 최적화 (2-3%)
- 내부 링크 구조 개선
- 정기적인 콘텐츠 업데이트

### 2. 기술적 최적화
- HTTPS 사용 (Vercel은 자동)
- CDN 활용 (Vercel Edge Network)
- 압축 및 캐싱
- 서버 응답 시간 최적화

### 3. 모바일 최적화
- 반응형 디자인 (✅ 이미 적용됨)
- 터치 타겟 크기 (최소 48x48px)
- 모바일 페이지 속도

## 📚 참고 자료

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

## 🔄 업데이트 내역

- 2025-01-31: 초기 SEO 설정 완료
  - 루트 및 페이지별 메타데이터
  - robots.txt, sitemap.xml
  - 구조화된 데이터
  - Open Graph 이미지
