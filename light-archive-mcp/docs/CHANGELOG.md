# Light Archive MCP - 변경 이력

## [v1.0.5] - 2025-01-07

### 🎯 파라미터 명확화: Data URI 형식 명시

#### 문제 발견
**v1.0.4의 한계:**
- `image_path` 파라미터 추가했지만 여전히 Base64 인코딩 문제 발생
- Claude Desktop이 도구 설명을 보고 수동 Base64 인코딩 시도
- "base64 -w 0 /path/to/image.png" 명령어 실행 후 멈춤
- Base64 문자열이 너무 길어서 UI 에러 발생

**실제 워크플로우 분석:**
```
사용자: [이미지 첨부]
→ Claude Desktop: /mnt/user-data/uploads/image.png에 저장
→ Claude: "archive_upload_image 도구를 사용하려면 Base64로 인코딩된 이미지 데이터가 필요합니다"
→ Claude: bash base64 -w 0 /mnt/user-data/uploads/image.png
→ ❌ 멈춤 (Base64 문자열 너무 길어서 UI 에러)
```

#### 해결책: Data URI 형식 명시

**핵심 인사이트:**
- Claude Desktop은 내부적으로 이미지를 Data URI 형식으로 처리
- 다른 MCP 서버(Cloudinary)는 "base64 data URI" 형식을 명시
- 파라미터 이름과 설명을 명확히 하면 Claude가 직접 제공

**변경 사항:**

1. **파라미터 이름 단순화**
   ```python
   # Before (v1.0.3-v1.0.4)
   class UploadImageInput(BaseModel):
       image_base64: Optional[str] = None
       image_path: Optional[str] = None

   # After (v1.0.5)
   class UploadImageInput(BaseModel):
       image: str = Field(
           ...,
           description="Image data as base64 data URI (e.g., data:image/png;base64,...)"
       )
   ```

2. **명확한 Data URI 형식 명시**
   - `image_base64` → `image` (단순화)
   - 설명에 "base64 data URI" 명시
   - 예시 포함: `data:image/png;base64,...`

3. **영향받는 도구 (3개)**
   - `archive_upload_image`: 이미지 업로드
   - `archive_analyze_image`: AI 이미지 분석
   - `archive_generate_draft_with_images`: 이미지 기반 초안 생성

**기대 효과:**
- ✅ Claude Desktop이 Data URI를 직접 제공
- ✅ 수동 Base64 인코딩 불필요
- ✅ "코드 크기로 인해 구문 강조가 비활성화" 에러 해결
- ✅ Cloudinary MCP와 동일한 패턴 사용

**참고:**
- Cloudinary MCP Server: "Path to file, URL, or base64 data URI to upload"
- Data URI 형식: `data:image/png;base64,iVBORw0KGgo...`
- Base64 문자열과 달리 메타데이터 포함

---

## [v1.0.4] - 2025-01-07

### 🚀 새 기능: 파일 경로 직접 지원

#### 이미지 업로드 방식 개선

**문제**:
- Claude Desktop이 이미지를 `/mnt/user-data/uploads/` 경로에 저장
- 기존 MCP 도구는 Base64 문자열만 받아서 수동 인코딩 필요
- "코드 크기로 인해 구문 강조가 비활성화" 에러 발생

**해결**:
- **파일 경로 직접 지원** 추가
- Base64 인코딩 불필요
- 두 가지 방식 모두 지원:
  1. `image_path`: 파일 경로 직접 전달 (신규) ✨
  2. `image_base64`: Base64 인코딩 (기존 방식 유지)

**변경된 도구**:

1. **`archive_upload_image`**
   ```python
   # Before (v1.0.3)
   {
     "image_base64": "iVBORw0K..."  # 필수
   }

   # After (v1.0.4)
   {
     "image_path": "/mnt/user-data/uploads/image.png"  # 또는
     "image_base64": "iVBORw0K..."  # 둘 중 하나
   }
   ```

2. **`archive_analyze_image`**
   ```python
   # 파일 경로로 AI 이미지 분석 가능
   {
     "image_path": "/tmp/screenshot.png",
     "prompt": "이 이미지를 분석해주세요"
   }
   ```

3. **`archive_generate_draft_with_images`**
   ```python
   # 여러 이미지 파일 경로 전달
   {
     "image_paths": ["/tmp/img1.png", "/tmp/img2.png"],
     "title": "프로젝트 제목",
     "category": "프로젝트"
   }
   ```

**기술적 변경사항**:
- `UploadImageInput` 모델에 `image_path` 필드 추가
- `AnalyzeImageInput` 모델에 `image_path` 필드 추가
- `GenerateDraftWithImagesInput` 모델에 `image_paths` 필드 추가
- `_upload_image_to_storage()` 함수 개선:
  - 파일 경로 받으면 직접 읽기
  - 파일 확장자 자동 추출
  - 파일 존재 여부 검증

**사용자 경험 개선**:
- ✅ Base64 인코딩 수동 작업 불필요
- ✅ Claude Desktop이 제공하는 경로 그대로 사용 가능
- ✅ 긴 Base64 문자열로 인한 UI 문제 해결
- ✅ 이전 Base64 방식도 여전히 지원 (하위 호환성)

**테스트 결과**:
- ✅ 파일 경로 방식 업로드
- ✅ Claude Desktop 스타일 경로 (`/mnt/user-data/uploads/`)
- ✅ Base64와 파일 경로 두 방식 모두 정상 작동

---

## [v1.0.3] - 2025-01-07

### 🐛 버그 수정

#### 이미지 업로드 실패 문제 해결

**문제**:
- v1.0.2에서 추가된 이미지 업로드 기능이 작동하지 않음
- Supabase Storage에 이미지가 업로드되지 않는 오류 발생
- 사용자가 "이거 올라가지도 않아"라고 보고

**원인**:
1. **잘못된 파라미터 사용**: Python SDK는 `file_options=` 파라미터 이름을 사용하지 않음
   ```python
   # ❌ 잘못된 코드
   supabase.storage.from_("thumbnails").upload(
       file_path, image_data,
       file_options={...}  # 파라미터 이름이 틀림
   )
   ```

2. **잘못된 옵션 키**: `cache-control` 대신 `cacheControl` 사용해야 함
3. **에러 처리 없음**: 업로드 실패를 감지하지 못함

**해결**:
1. **올바른 SDK 사용법 적용**
   ```python
   # ✅ 올바른 코드 (Supabase Python SDK 공식 문서 참고)
   response = supabase.storage.from_("thumbnails").upload(
       file_path,
       image_data,
       {  # 세 번째 인자로 딕셔너리 직접 전달
           "content-type": f"image/{file_extension}",
           "cacheControl": "3600",
           "upsert": "false"
       }
   )
   ```

2. **에러 처리 추가**
   - try-except 블록으로 Base64 디코딩 에러 처리
   - 업로드 응답 체크 (response.error)
   - 명확한 에러 메시지 반환

3. **Next.js 앱과 동일한 로직**
   - TypeScript: `upload(path, file, options)`
   - Python: `upload(path, data, options)` (동일한 시그니처)

**영향**:
- ✅ 이미지 업로드 정상 작동
- ✅ Supabase Storage에 이미지 올라감 확인
- ✅ 업로드 실패 시 명확한 에러 메시지 반환
- ✅ Next.js 앱과 완전히 동일한 로직 사용

**참고 문서**:
- Supabase Storage Python SDK: `/supabase/storage-py`
- 공식 예제: `await storage_client.from_("bucket").upload("/path", file_object, {"content-type": "image/png"})`

---

## [v1.0.2] - 2025-01-07

### 🎉 새 기능: 이미지 업로드 및 AI 분석

#### 추가된 도구 (3개)

1. **`archive_upload_image`** - 이미지 Supabase Storage 업로드
   - Base64 이미지를 받아 `thumbnails/archive-images/`에 저장
   - Public URL 반환
   - Next.js 앱과 동일한 파일명 패턴 사용

2. **`archive_analyze_image`** - AI 이미지 분석
   - OpenAI Vision API (gpt-4o-mini) 사용
   - 이미지 내용, 구성, 색상, 분위기 분석
   - 커스텀 프롬프트 지원

3. **`archive_generate_draft_with_images`** - 이미지 기반 초안 생성
   - 최대 5개 이미지 동시 처리
   - 이미지 분석 → 업로드 → 초안 생성 자동화
   - HTML 형식으로 이미지 포함

#### 기술적 변경사항
- `base64`, `io` 모듈 import 추가
- `_upload_image_to_storage()` 유틸리티 함수 추가
- Pydantic 모델 3개 추가:
  - `UploadImageInput`
  - `AnalyzeImageInput`
  - `GenerateDraftWithImagesInput`

#### 사용 예시
```
Claude에게: [스크린샷 첨부]
"이 프로젝트 이미지들로 아카이브 초안 만들어줘"
```

→ 자동으로 이미지 업로드 + 분석 + 초안 생성!

**자세한 가이드**: `docs/IMAGE_FEATURES.md`

---

## [v1.0.1] - 2025-01-07

### 🐛 버그 수정

#### ID 자동 생성 기능 추가

**문제**:
- `archive_create_archive` 도구 사용 시 ID 필드가 null로 들어가 오류 발생
- Supabase가 ID를 자동 생성하지 않음
- Next.js 앱은 클라이언트에서 ID를 생성하지만, MCP 서버에는 누락됨

**해결**:
1. **ID 생성 함수 추가** (`_generate_archive_id()`)
   ```python
   def _generate_archive_id() -> str:
       """
       아카이브 ID 생성 (Next.js 앱과 동일한 패턴)
       패턴: {timestamp}-{random_string}
       예: 1761901131544-a2mnqr
       """
       timestamp = str(int(time.time() * 1000))
       random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
       return f"{timestamp}-{random_chars}"
   ```

2. **모듈 import 추가**
   - `import time`: 타임스탬프 생성
   - `import random`: 랜덤 문자열 생성
   - `import string`: 문자 집합 사용

3. **`archive_create_archive` 함수 수정**
   - 아카이브 생성 전 자동으로 ID 생성
   - Next.js 앱의 ID 생성 패턴과 동일하게 동작

**영향**:
- ✅ 아카이브 생성 시 더 이상 ID null 오류 발생하지 않음
- ✅ Next.js 앱과 동일한 ID 패턴 사용
- ✅ ID 충돌 위험 최소화 (밀리초 타임스탬프 + 랜덤)

---

## [v1.0.0] - 2025-01-07

### 🎉 초기 릴리즈

#### 주요 기능

**CRUD 도구 (4개)**:
- `archive_search_archives`: 전체 검색
- `archive_get_archive`: 상세 조회
- `archive_create_archive`: 생성
- `archive_update_archive`: 수정

**AI 기능 (3개)**:
- `archive_generate_draft`: AI 초안 자동 생성 (OpenAI GPT-4o-mini)
- `archive_generate_summary`: 본문 요약
- `archive_suggest_tags`: 태그/기술 자동 추천

**추가 도구 (2개)**:
- `archive_find_related`: 유사 항목 추천
- `archive_list_archives`: 목록 조회

#### 기술 스택
- Python 3.9+
- FastMCP (MCP 프레임워크)
- Supabase (PostgreSQL)
- OpenAI API (GPT-4o-mini)
- Pydantic v2 (데이터 검증)

#### 데이터베이스
- 테이블: `archive_items` (단일 테이블)
- 배열 필드: `tags[]`, `technologies[]`
- ID 패턴: `{timestamp}-{random_string}`

---

## 업데이트 방법

### 기존 사용자

```bash
cd /path/to/light-archive-mcp

# 최신 코드 가져오기 (Git 사용 시)
git pull origin main

# 또는 파일 직접 교체
# light_archive_mcp_fixed.py를 최신 버전으로 교체

# 가상환경 재활성화 (선택)
source .venv/bin/activate

# Claude Desktop 재시작
# Cmd + Q로 종료 후 재실행
```

### 변경 사항 확인

```bash
# Python 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py

# 환경 변수 확인
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('✅' if os.getenv('NEXT_PUBLIC_SUPABASE_URL') else '❌')"
```

---

## 버전 관리

### 버전 번호 규칙
- **Major (1.x.x)**: 호환성이 깨지는 변경
- **Minor (x.1.x)**: 새 기능 추가 (하위 호환)
- **Patch (x.x.1)**: 버그 수정

### 현재 버전
**v1.0.1** - ID 자동 생성 버그 수정

---

## 알려진 문제

### 해결됨
- ✅ ID null 오류 (v1.0.1에서 해결)

### 계획된 개선사항
- [ ] 벌크 생성 지원 (여러 아카이브 한 번에)
- [ ] 이미지 업로드 자동화
- [ ] 태그 자동 완성 제안
- [ ] 초안 템플릿 커스터마이징

---

## 기여

문제를 발견하셨나요? 개선 아이디어가 있으신가요?
- GitHub Issues: https://github.com/lightsoft-dev/Light-Archive/issues
- 또는 Pull Request를 제출해주세요!
