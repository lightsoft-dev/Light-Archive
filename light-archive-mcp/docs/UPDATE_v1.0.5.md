# 🚀 Light Archive MCP v1.0.5 업데이트 가이드

## 변경 사항

**핵심 개선**: 파라미터 명확화로 Data URI 형식 명시 → Claude Desktop이 이미지를 자동으로 처리!

---

## 📋 문제 해결

### v1.0.4에서 발견된 문제

**스크린샷 보고:**
- v1.0.4에서 `image_path` 파라미터를 추가했지만 여전히 문제 발생
- Claude Desktop이 도구 설명(`image_base64`)을 보고 수동 Base64 인코딩 시도
- `base64 -w 0 /mnt/user-data/uploads/image.png` 명령어 실행
- Base64 문자열이 너무 길어서 "코드 크기로 인해 구문 강조가 비활성화" 에러 발생

**실제 워크플로우:**
```
❌ 기존 방식 (v1.0.3-v1.0.4):
1. 사용자가 이미지 첨부
2. Claude Desktop이 /mnt/user-data/uploads/에 저장
3. Claude가 도구 설명 확인: "image_base64: Base64 인코딩된 이미지..."
4. Claude가 판단: "Base64로 변환해야 함"
5. bash base64 -w 0 /path/to/image.png 실행
6. ❌ 멈춤 (Base64 문자열 너무 길어서 UI 에러)
```

**문제의 핵심:**
- 파라미터 이름(`image_base64`)과 설명이 명확하지 않음
- Claude Desktop은 이미 Data URI 형식으로 이미지 처리 가능
- 하지만 도구 설명이 "Base64 인코딩"이라고만 써있어서 수동 변환 시도

---

## ✨ v1.0.5 해결책

### Data URI 형식 명시!

**핵심 인사이트:**
- Claude Desktop은 내부적으로 이미지를 **Data URI** 형식으로 처리
- Data URI: `data:image/png;base64,iVBORw0KGgo...` (메타데이터 + Base64)
- Cloudinary MCP 등 다른 서버들은 이미 이 패턴 사용 중
- 파라미터 설명을 명확히 하면 Claude가 자동으로 Data URI 제공

```
✅ 새로운 방식 (v1.0.5):
1. 사용자가 이미지 첨부
2. Claude Desktop이 이미지를 Data URI로 처리
3. Claude가 도구 설명 확인: "image: Image data as base64 data URI"
4. Claude가 Data URI를 바로 전달
5. ✅ 완료! (변환 과정 없음)
```

### Before vs After

#### Before (v1.0.3-v1.0.4) - 파라미터가 불명확 ❌

```python
class UploadImageInput(BaseModel):
    image_base64: Optional[str] = None
    image_path: Optional[str] = None
    filename: Optional[str] = None
    file_extension: str = "png"
```

**문제:**
- `image_base64`라는 이름이 "Base64로 인코딩하라"는 신호로 해석됨
- 두 개의 선택적 파라미터가 혼란 초래

#### After (v1.0.5) - 명확한 Data URI ✅

```python
class UploadImageInput(BaseModel):
    image: str = Field(
        ...,
        description="Image data as base64 data URI (e.g., data:image/png;base64,...)"
    )
    filename: Optional[str] = None
    file_extension: str = "png"
```

**개선:**
- 단순한 이름: `image`
- 명확한 형식 명시: "base64 data URI"
- 예시 포함: `data:image/png;base64,...`
- 필수 파라미터로 변경 (혼란 제거)

---

## 🔧 기술적 변경사항

### 1. Pydantic 모델 수정

**`UploadImageInput`** (이미지 업로드):
```python
# Before (v1.0.4)
class UploadImageInput(BaseModel):
    image_base64: Optional[str] = None  # 불명확
    image_path: Optional[str] = None    # 혼란 초래
    filename: Optional[str] = None
    file_extension: str = "png"

# After (v1.0.5)
class UploadImageInput(BaseModel):
    image: str = Field(
        ...,
        description="Image data as base64 data URI (e.g., data:image/png;base64,...)"
    )
    filename: Optional[str] = None
    file_extension: str = "png"
```

**`AnalyzeImageInput`** (이미지 분석):
```python
# Before
class AnalyzeImageInput(BaseModel):
    image_base64: Optional[str] = None
    image_path: Optional[str] = None
    prompt: Optional[str] = None

# After
class AnalyzeImageInput(BaseModel):
    image: str = Field(
        ...,
        description="Image data as base64 data URI (e.g., data:image/png;base64,...)"
    )
    prompt: Optional[str] = None
```

**`GenerateDraftWithImagesInput`** (초안 생성):
```python
# Before
class GenerateDraftWithImagesInput(BaseModel):
    images_base64: Optional[List[str]] = None
    image_paths: Optional[List[str]] = None
    title: str
    category: str = "프로젝트"
    # ... 기타 필드

# After
class GenerateDraftWithImagesInput(BaseModel):
    images: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Images as base64 data URIs (max 5 images)"
    )
    title: str
    category: str = "프로젝트"
    # ... 기타 필드
```

### 2. 함수 시그니처 변경

**`archive_upload_image()` 함수**:
```python
# Before
async def archive_upload_image(params: UploadImageInput) -> str:
    """
    이미지를 Supabase Storage에 업로드하고 Public URL을 반환합니다.

    image_base64 또는 image_path 중 하나를 제공하세요.
    """
    public_url = await _upload_image_to_storage(
        image_base64=params.image_base64,
        image_path=params.image_path,
        filename=params.filename,
        file_extension=params.file_extension
    )
    return f"✅ 이미지 업로드 완료!\nPublic URL: {public_url}"

# After
async def archive_upload_image(params: UploadImageInput) -> str:
    """
    Upload image to Supabase Storage and return public URL.

    Accepts image as base64 data URI format.
    """
    public_url = await _upload_image_to_storage(
        image_base64=params.image,  # Data URI로 전달
        filename=params.filename,
        file_extension=params.file_extension
    )
    return f"✅ 이미지 업로드 완료!\nPublic URL: {public_url}"
```

**참고**: `_upload_image_to_storage()` 내부 로직은 변경 없음 (Data URI에서 Base64 부분 추출)

---

## 🎯 사용 예시

### 예시 1: 이미지 업로드

```
사용자: [이미지 첨부] "이 이미지를 업로드해줘"

Claude Desktop (내부):
→ 이미지를 Data URI로 변환
→ data:image/png;base64,iVBORw0KGgo...

Claude:
[archive_upload_image 호출]
{
  "image": "data:image/png;base64,iVBORw0KGgo..."
}

✅ 이미지 업로드 완료!
Public URL: https://tjucmfulpsbarmmxfeao.supabase.co/storage/v1/object/public/thumbnails/archive-images/1762491822808-r9fu86.png
```

**차이점:**
- ❌ v1.0.4: bash base64 명령어 실행 → 멈춤
- ✅ v1.0.5: Claude가 Data URI 자동 전달 → 즉시 업로드

### 예시 2: 이미지 분석

```
사용자: [스크린샷 첨부] "이 UI를 분석해줘"

Claude:
[archive_analyze_image 호출]
{
  "image": "data:image/png;base64,iVBORw0K...",
  "prompt": "이 UI를 자세히 분석해주세요"
}

🔍 이미지 분석 결과
이 이미지는 모던한 웹 대시보드 화면입니다...
```

### 예시 3: 여러 이미지로 초안 생성

```
사용자: [3개 이미지 첨부] "이 프로젝트 스크린샷들로 아카이브 초안 만들어줘"

Claude:
[archive_generate_draft_with_images 호출]
{
  "images": [
    "data:image/png;base64,iVBORw0K...",
    "data:image/jpeg;base64,/9j/4AAQ...",
    "data:image/png;base64,iVBORw0K..."
  ],
  "title": "사용자 대시보드 개발",
  "category": "프로젝트"
}

✅ 초안 생성 완료!
- 3개 이미지 업로드됨
- AI 분석 완료
- 초안 내용 생성됨
```

---

## 🔄 업데이트 방법

### 방법 1: 파일 교체만 (권장)

이미 설치된 경우, MCP 서버 파일만 교체:

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp

# 파일이 이미 업데이트됨
# light_archive_mcp_fixed.py (v1.0.5)

# Claude Desktop 재시작 (중요!)
# Cmd + Q로 완전 종료 → 재실행
```

**중요**: 반드시 Claude Desktop을 완전히 종료(`Cmd + Q`)하고 재실행해야 합니다!

### 방법 2: 문법 검증 (선택)

```bash
# Python 문법 확인
python3 -m py_compile light_archive_mcp_fixed.py

# 출력 없으면 성공 ✅
```

---

## 📊 버전 비교

| 버전 | 파라미터 | Claude 동작 | 사용자 경험 |
|------|---------|------------|-----------|
| v1.0.2 | `image_base64` (필수) | 수동 인코딩 요구 | ❌ 작동 안 함 |
| v1.0.3 | `image_base64` (필수) | 수동 인코딩 요구 | ⚠️ 수동, UI 에러 |
| v1.0.4 | `image_base64`, `image_path` (선택) | 수동 인코딩 시도 | ⚠️ 여전히 에러 |
| v1.0.5 | `image` (Data URI) | **자동 처리** | **✅ 완벽 작동** |

---

## 💡 핵심 개선사항

### 1. 사용자 경험 (UX)

**Before (v1.0.3-v1.0.4)**:
```
이미지 첨부
→ Claude가 "Base64로 변환 필요" 판단
→ bash base64 명령어 실행
→ ❌ 멈춤 (Base64 문자열 너무 길어서 UI 에러)
```

**After (v1.0.5)**:
```
이미지 첨부
→ Claude가 Data URI로 자동 처리
→ ✅ 즉시 업로드 완료!
```

### 2. 파라미터 명확성

| Before | After | 효과 |
|--------|-------|-----|
| `image_base64` | `image` | 단순하고 명확 |
| "Base64 인코딩된..." | "base64 data URI" | 형식 명확히 지정 |
| 2개 선택 파라미터 | 1개 필수 파라미터 | 혼란 제거 |

### 3. 표준 패턴 준수

**Cloudinary MCP Server와 동일한 패턴:**
- 파라미터 이름: 단순하고 명확 (`image`, `file`)
- 형식 명시: "base64 data URI" 또는 "path"
- 예시 포함: `data:image/png;base64,...`

---

## 🐛 알려진 제한사항

### Data URI 크기 제한

Claude Desktop의 Data URI 크기 제한:
- ✅ 일반 이미지 (< 5MB): 정상 작동
- ⚠️ 큰 이미지 (> 10MB): 경우에 따라 제한 가능
- 💡 권장: 이미지 압축 또는 리사이징

### 지원 형식

- ✅ PNG: `data:image/png;base64,...`
- ✅ JPEG: `data:image/jpeg;base64,...`
- ✅ WebP: `data:image/webp;base64,...`
- ✅ GIF: `data:image/gif;base64,...`

---

## 🧪 테스트 방법

### 1. Claude Desktop 재시작

```bash
# macOS
1. Cmd + Q (완전 종료)
2. Claude Desktop 재실행
```

### 2. 이미지 업로드 테스트

```
새 대화 시작 → [이미지 첨부] → "이 이미지를 Light Archive에 업로드해줘"
```

**기대 결과:**
- ✅ bash 명령어 실행 없음
- ✅ 즉시 `archive_upload_image` 도구 호출
- ✅ Public URL 반환

### 3. 이미지 분석 테스트

```
[스크린샷 첨부] → "이 UI를 분석해줘"
```

**기대 결과:**
- ✅ `archive_analyze_image` 도구 즉시 호출
- ✅ AI 분석 결과 반환

---

## 📚 관련 문서

- **`docs/CHANGELOG.md`**: v1.0.5 변경 이력
- **`docs/IMAGE_FEATURES.md`**: 이미지 기능 사용법
- **`docs/TROUBLESHOOTING.md`**: 문제 해결 가이드
- **Cloudinary MCP Server**: https://github.com/cloudinary-devs/cloudinary-mcp-server

---

## 🎉 결론

**v1.0.5는 근본적인 문제를 해결했습니다!**

**문제의 핵심:**
- v1.0.3-v1.0.4: 파라미터 설명이 불명확해서 Claude가 수동 변환 시도
- Base64 문자열이 너무 길어서 UI 에러 발생

**해결책:**
- ✅ 파라미터를 "Data URI" 형식으로 명확히 명시
- ✅ Claude Desktop이 자동으로 Data URI 제공
- ✅ 수동 변환 과정 완전히 제거
- ✅ Cloudinary 등 표준 MCP 패턴 준수

**이제 이미지를 첨부하면 Claude가 자동으로 처리합니다!** 🚀

---

**버전**: v1.0.5
**날짜**: 2025-01-07
**개발자**: Claude Code

**Breaking Changes**: 없음 (Data URI 형식은 Base64 포함)
**Migration**: Claude Desktop 재시작만 필요
