# OpenAI API 테스트 페이지

## 📍 페이지 위치
`/test/openai`

## 🎯 목적
Light Archive 프로젝트에서 사용하는 OpenAI API가 정상적으로 작동하는지 테스트합니다.

## ✨ 주요 기능

### 1. API Key 상태 확인
- 환경 변수에 `OPENAI_API_KEY`가 설정되어 있는지 확인
- API Key 형식 검증 (sk-로 시작하는지)
- 실시간 상태 표시 (체크 아이콘)

### 2. 프롬프트 테스트
- 자유롭게 프롬프트 입력 가능
- OpenAI API 호출 및 응답 확인
- 에러 처리 및 상세 로그 표시

### 3. 템플릿 예시
- **기술 문서 초안**: 기술 문서 스타일로 초안 생성
- **프로젝트 개요**: 프로젝트 설명 생성
- **요약 생성**: 긴 텍스트를 한 문장으로 요약
- **태그 제안**: 프로젝트에 맞는 태그 추천

## 🛠️ 사용 방법

### 1. 환경 변수 설정
`.env.local` 파일에 OpenAI API Key 추가:
```env
OPENAI_API_KEY=sk-proj-...
```

### 2. 개발 서버 실행
```bash
pnpm dev
```

### 3. 테스트 페이지 접속
브라우저에서 `http://localhost:3000/test/openai` 접속

### 4. 테스트 실행
1. API Key 상태가 "✅ 설정되어 있습니다"인지 확인
2. 템플릿 예시 중 하나를 선택하거나 직접 프롬프트 입력
3. "OpenAI 테스트 실행" 버튼 클릭
4. 응답 확인

## 📊 API 설정

### 현재 설정
- **모델**: `gpt-4o-mini` (빠르고 저렴한 모델)
- **최대 토큰**: 500개
- **Temperature**: 0.7 (창의성 수준)
- **System Prompt**: "기술 문서 작성 전문가"

### 설정 변경
`app/api/openai/test/route.ts` 파일에서 수정 가능:

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini", // 모델 변경: gpt-4, gpt-4-turbo 등
  max_tokens: 500,      // 응답 길이 조정
  temperature: 0.7,     // 창의성 조정 (0~2)
})
```

## 🔍 API 라우트

### 1. API Key 체크
- **경로**: `GET /api/openai/check`
- **기능**: 환경 변수에 API Key가 설정되어 있는지 확인
- **응답**:
  ```json
  {
    "configured": true,
    "message": "API Key가 설정되어 있습니다"
  }
  ```

### 2. OpenAI 테스트
- **경로**: `POST /api/openai/test`
- **Request Body**:
  ```json
  {
    "prompt": "프롬프트 내용"
  }
  ```
- **응답 (성공)**:
  ```json
  {
    "success": true,
    "response": "OpenAI 응답 내용",
    "usage": {
      "prompt_tokens": 50,
      "completion_tokens": 100,
      "total_tokens": 150
    },
    "model": "gpt-4o-mini"
  }
  ```
- **응답 (실패)**:
  ```json
  {
    "error": "에러 메시지"
  }
  ```

## ⚠️ 에러 처리

### 401 Unauthorized
```
OpenAI API Key가 유효하지 않습니다.
→ .env.local 파일의 OPENAI_API_KEY를 확인하세요
```

### 429 Too Many Requests
```
OpenAI API 요청 한도를 초과했습니다.
→ 잠시 후 다시 시도하세요
→ OpenAI Dashboard에서 요청 한도 확인
```

### 500 Server Error
```
OpenAI 서버 에러가 발생했습니다.
→ 잠시 후 다시 시도하세요
→ OpenAI Status 페이지 확인 (status.openai.com)
```

## 💰 비용 관리

### gpt-4o-mini 가격 (2025년 1월 기준)
- **Input**: $0.150 / 1M tokens
- **Output**: $0.600 / 1M tokens

### 예시 계산
- 프롬프트 100 토큰 + 응답 400 토큰 = 500 토큰
- 비용: (100 × $0.15 + 400 × $0.6) / 1,000,000 = **$0.00026** (약 0.3원)

### 비용 절감 팁
1. `max_tokens`를 필요한 만큼만 설정
2. 짧고 명확한 프롬프트 작성
3. 불필요한 테스트 반복 지양
4. OpenAI Dashboard에서 사용량 모니터링

## 🔗 관련 링크

- [OpenAI API 문서](https://platform.openai.com/docs)
- [OpenAI 모델 가격](https://openai.com/api/pricing/)
- [OpenAI Dashboard](https://platform.openai.com/)
- [OpenAI Status](https://status.openai.com/)

## 🚀 실제 프로젝트 적용

이 테스트 페이지가 정상 작동하면, `/app/admin/new/page.tsx`의 AI 초안 생성 기능에서 실제 OpenAI API를 호출하도록 수정할 수 있습니다.

### 현재 상태 (app/admin/new/page.tsx:92-95)
```typescript
// TODO: AI API 호출
// 현재는 시뮬레이션
await new Promise(resolve => setTimeout(resolve, 2000))
```

### 수정 방안
```typescript
// OpenAI API 호출
const response = await fetch("/api/openai/generate-draft", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: aiPrompt,
    title,
    category,
  }),
})
const data = await response.json()
setContent(data.response)
```

## 📝 참고사항

- 이 페이지는 **개발 환경**에서만 사용하세요
- 프로덕션 배포 시에는 `/test` 폴더를 제외하거나 인증을 추가하세요
- API Key는 **절대 클라이언트에 노출하지 마세요** (서버 API 라우트에서만 사용)
- OpenAI API 요청 제한을 고려하여 테스트하세요 (기본: 분당 10회)
