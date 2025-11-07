# 🖼️ Light Archive MCP - 이미지 기능 가이드

v1.0.2에서 추가된 이미지 업로드 및 분석 기능 사용 가이드입니다.

---

## 🎉 새로 추가된 기능

### 1. `archive_upload_image` - 이미지 업로드
Claude에게 이미지를 보내면 Supabase Storage에 자동으로 업로드합니다.

### 2. `archive_analyze_image` - AI 이미지 분석
OpenAI Vision을 사용하여 이미지의 내용을 분석합니다.

### 3. `archive_generate_draft_with_images` - 이미지 기반 초안 생성
이미지를 업로드하고 분석하여 자동으로 아카이브 초안을 생성합니다.

---

## 📸 사용 방법

### 방법 1: 단순 이미지 업로드

**Claude에게 이렇게 말하세요**:
```
[이미지 첨부]

이 이미지를 업로드해줘
```

**MCP 도구**: `archive_upload_image`
- 이미지를 Supabase Storage의 `thumbnails/archive-images/` 폴더에 업로드
- Public URL 반환
- 아카이브의 썸네일이나 본문에 사용 가능

**결과**:
```
✅ 이미지 업로드 완료

Public URL: https://...supabase.co/storage/v1/object/public/thumbnails/archive-images/1762484732930-jgqxx0.png

<img src="..." alt="Uploaded Image" />
```

---

### 방법 2: 이미지 분석

**Claude에게 이렇게 말하세요**:
```
[스크린샷 첨부]

이 이미지가 무엇인지 자세히 분석해줘
```

**MCP 도구**: `archive_analyze_image`
- OpenAI Vision API (gpt-4o-mini)로 이미지 분석
- 주요 요소, 색상, 구성, 분위기 등 설명

**결과**:
```
🔍 이미지 분석 결과

이 이미지는 웹 애플리케이션의 대시보드 화면입니다...
- 상단: 네비게이션 바 (검정색 배경)
- 좌측: 사이드바 메뉴
- 중앙: 데이터 테이블
...
```

---

### 방법 3: 이미지 기반 초안 자동 생성 ⭐ (추천!)

**Claude에게 이렇게 말하세요**:
```
[프로젝트 스크린샷 3장 첨부]

이 이미지들을 기반으로 "사용자 대시보드 개발" 프로젝트 아카이브 초안을 만들어줘.

카테고리: 프로젝트
기술: React, TypeScript, Tailwind CSS
설명: Next.js로 구현한 반응형 대시보드
```

**MCP 도구**: `archive_generate_draft_with_images`
1. 모든 이미지를 Supabase에 업로드
2. 첫 번째 이미지를 OpenAI Vision으로 분석
3. 이미지 내용을 기반으로 초안 자동 생성
4. 업로드된 이미지들을 HTML로 본문에 삽입

**결과**:
```markdown
✅ 이미지 기반 초안 생성 완료

업로드된 이미지: 3개

## 이미지 URL
- https://...supabase.co/.../image1.png
- https://...supabase.co/.../image2.png
- https://...supabase.co/.../image3.png

## 생성된 초안

<h1>사용자 대시보드 개발</h1>

## 📌 개요
이미지들은 모던한 웹 대시보드를 보여줍니다...

## 🎯 주요 특징
- 반응형 레이아웃
- 다크/라이트 모드 지원
- 실시간 데이터 시각화

## 💡 기술적 세부사항
...

## 📸 프로젝트 이미지
<img src="..." />
<img src="..." />
<img src="..." />

---

다음 단계:
1. 초안 내용 검토 및 수정
2. archive_create_archive로 아카이브 생성
3. 썸네일: https://...
```

---

## 🎯 실전 워크플로우

### 시나리오: 프로젝트 문서화

1. **프로젝트 스크린샷 준비**
   - 주요 화면 3-5개 캡처
   - 특징적인 기능 스크린샷

2. **Claude와 대화**
```
[스크린샷들 첨부]

이 프로젝트의 아카이브를 만들고 싶어.

제목: "AI 기반 이미지 검색 엔진"
카테고리: 프로젝트
기술: Python, FastAPI, OpenAI CLIP, React
분야: Computer Vision

이미지들을 분석해서 초안을 만들어줘.
```

3. **Claude가 자동으로**:
   - ✅ 이미지 업로드 (Supabase Storage)
   - ✅ 이미지 분석 (OpenAI Vision)
   - ✅ 초안 생성 (구조화된 Markdown/HTML)
   - ✅ 이미지 삽입 (본문에 자동 포함)

4. **초안 검토 및 수정**
```
좋아! 이제 이 초안으로 아카이브를 만들어줘.
썸네일은 첫 번째 이미지 사용하고,
태그는 "AI", "Computer Vision", "Image Search" 추가해줘.
```

5. **아카이브 생성**
   - Claude가 `archive_create_archive` 도구 사용
   - 이미지 URL과 초안 내용 포함
   - 자동으로 ID 생성 및 DB 저장

---

## 🔧 기술적 세부사항

### Supabase Storage 구조

**버킷**: `thumbnails`
**경로**: `archive-images/{timestamp}-{random}.{ext}`

**예시**:
```
thumbnails/
  └── archive-images/
      ├── 1762484732930-jgqxx0.png
      ├── 1762484733125-k2m5lo.jpg
      └── 1762484733340-p7n2aq.webp
```

### 지원 이미지 형식
- PNG (권장)
- JPEG / JPG
- GIF
- WebP

### 파일명 패턴
Next.js 앱과 동일한 패턴 사용:
```
{밀리초 타임스탬프}-{랜덤6자리}.{확장자}
예: 1762484732930-jgqxx0.png
```

### Base64 인코딩

Claude가 이미지를 자동으로 Base64로 인코딩해서 전송합니다.

**형식**:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

MCP 서버가 자동으로 처리:
1. 접두사 제거 (`data:image/png;base64,`)
2. Base64 디코딩
3. Supabase 업로드

---

## 🔍 OpenAI Vision API

### 모델
- **gpt-4o-mini**: Vision 지원, 빠르고 저렴

### 기능
- 이미지 내용 인식
- 텍스트 추출 (OCR)
- 객체 검출
- 색상 및 구성 분석
- UI/UX 평가

### 비용
- 이미지당 약 $0.01 (1024x1024 기준)
- 텍스트 토큰과 별도 청구

---

## 💡 활용 팁

### Tip 1: 여러 각도의 스크린샷
```
[홈화면, 상세화면, 설정화면 첨부]

이 3개 화면을 분석해서 프로젝트 초안 만들어줘
```

→ AI가 다양한 각도에서 프로젝트를 이해하고 풍부한 초안 생성

### Tip 2: 다이어그램 활용
```
[아키텍처 다이어그램 첨부]

이 구조도를 기반으로 기술 문서 초안 작성해줘
```

→ 복잡한 시스템도 이미지로 쉽게 설명 가능

### Tip 3: 기존 문서 스캔
```
[회의록 스캔 이미지 첨부]

이 회의록 내용을 바탕으로 아카이브 만들어줘
```

→ 종이 문서도 디지털화 가능

### Tip 4: 비교 분석
```
[Before 스크린샷, After 스크린샷 첨부]

리팩토링 전후 비교 문서 만들어줘
```

→ 변경 사항을 시각적으로 문서화

---

## ⚠️ 주의사항

### 1. 이미지 크기
- 권장: 1MB 이하
- 최대: 5MB (Supabase 제한)
- 큰 이미지는 자동으로 압축하지 않음

### 2. 개수 제한
- `archive_generate_draft_with_images`: 최대 5개
- 더 많은 이미지는 여러 번 나눠서 업로드

### 3. Storage 권한
- Supabase Storage의 RLS 정책 확인 필요
- `thumbnails` 버킷이 public read 설정되어야 함

### 4. API 비용
- OpenAI Vision API는 유료 서비스
- 많은 이미지 처리 시 비용 발생
- `.env`에 `OPENAI_API_KEY` 설정 필요

---

## 🐛 트러블슈팅

### "Image upload failed: Permission denied"

**원인**: Supabase Storage RLS 정책 미설정

**해결**:
1. Supabase Dashboard → Storage → `thumbnails`
2. Policies → New Policy
3. "Enable public access" 선택

```sql
-- 공개 읽기 정책
CREATE POLICY "Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- 인증된 사용자 쓰기 정책
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');
```

### "OpenAI not initialized"

**원인**: OpenAI API 키 없음

**해결**:
```bash
# .env 파일에 추가
OPENAI_API_KEY=sk-proj-your-key-here
```

### "Base64 decoding error"

**원인**: 잘못된 Base64 형식

**해결**: Claude가 자동으로 처리하므로 보통 발생하지 않음. 수동 입력 시에만 발생 가능.

---

## 📊 버전 정보

**추가된 버전**: v1.0.2
**추가된 도구**: 3개
**필수 의존성**:
- `base64` (Python 기본 모듈)
- `io` (Python 기본 모듈)
- OpenAI API (Vision 기능)
- Supabase Storage

---

## 🚀 다음 단계

이미지 기능을 추가했으니:

1. **Claude Desktop 재시작**
   ```bash
   # Cmd + Q로 완전 종료
   # 다시 실행
   ```

2. **첫 테스트**
   ```
   [스크린샷 첨부]

   이 이미지를 분석해줘!
   ```

3. **실전 활용**
   - 프로젝트 스크린샷으로 문서 자동 생성
   - 회의록 사진으로 아카이브 작성
   - UI 디자인 리뷰 문서화

---

**이제 이미지로 더 쉽게 아카이브를 만드세요!** 🎉
