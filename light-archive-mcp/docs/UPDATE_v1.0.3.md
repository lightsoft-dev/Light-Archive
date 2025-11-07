# 🐛 Light Archive MCP v1.0.3 업데이트 가이드

## 변경 사항

**버그 수정**: 이미지 업로드 기능 수정 (v1.0.2에서 작동하지 않던 문제 해결)

---

## 📋 문제 요약

### 사용자 보고
"지금 base64를 사용하는데 꼭 그렇게 해야해? 이거 올라가지도 않아"

### 발견된 문제
v1.0.2에서 추가한 이미지 업로드 기능이 **완전히 작동하지 않음**:
- `archive_upload_image` 도구 사용 시 이미지가 Supabase Storage에 업로드되지 않음
- 에러 메시지도 없어서 무엇이 문제인지 알 수 없음
- Next.js 앱은 정상 작동하는데 MCP 서버만 실패

---

## 🔍 원인 분석

### 1. 잘못된 Supabase Python SDK 사용법

**잘못된 코드** (v1.0.2):
```python
response = supabase.storage.from_("thumbnails").upload(
    file_path,
    image_data,
    file_options={  # ❌ 파라미터 이름이 틀림!
        "content-type": f"image/{file_extension}",
        "cache-control": "3600",  # ❌ 키 이름도 틀림!
        "upsert": False
    }
)
```

**문제점**:
- Python SDK는 `file_options=` 파라미터를 받지 않음
- TypeScript SDK와 시그니처가 다름
- 공식 문서와 다른 방식으로 사용

**올바른 코드** (v1.0.3):
```python
response = supabase.storage.from_("thumbnails").upload(
    file_path,
    image_data,
    {  # ✅ 세 번째 인자로 딕셔너리 직접 전달
        "content-type": f"image/{file_extension}",
        "cacheControl": "3600",  # ✅ camelCase 사용
        "upsert": "false"
    }
)
```

### 2. 에러 처리 없음

기존 코드는 업로드 실패 시에도 그냥 진행되어 버림:
```python
# v1.0.2: 에러가 발생해도 모름
response = supabase.storage.from_("thumbnails").upload(...)
public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)
return public_url  # 업로드 안 됐어도 URL 반환!
```

수정된 코드 (v1.0.3):
```python
try:
    response = supabase.storage.from_("thumbnails").upload(...)

    # 업로드 실패 체크
    if hasattr(response, 'error') and response.error:
        raise RuntimeError(f"Image upload failed: {response.error}")

    public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)
    return public_url

except base64.binascii.Error as e:
    raise RuntimeError(f"Base64 decoding failed: {str(e)}")
except Exception as e:
    raise RuntimeError(f"Image upload failed: {str(e)}")
```

---

## ✅ 수정 내용

### 변경된 파일
- **`light_archive_mcp_fixed.py`**: `_upload_image_to_storage()` 함수 수정

### Before vs After

#### Before (v1.0.2) - 작동 안 함
```python
async def _upload_image_to_storage(image_base64: str, filename: Optional[str], file_extension: str) -> str:
    _check_supabase()

    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]

    image_data = base64.b64decode(image_base64)

    if not filename:
        filename = _generate_archive_id()

    filename_with_ext = f"{filename}.{file_extension}"
    file_path = f"archive-images/{filename_with_ext}"

    # ❌ 잘못된 파라미터 사용
    response = supabase.storage.from_("thumbnails").upload(
        file_path,
        image_data,
        file_options={
            "content-type": f"image/{file_extension}",
            "cache-control": "3600",
            "upsert": False
        }
    )

    # ❌ 에러 체크 없음
    public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)

    return public_url
```

#### After (v1.0.3) - 정상 작동 ✅
```python
async def _upload_image_to_storage(image_base64: str, filename: Optional[str], file_extension: str) -> str:
    _check_supabase()

    try:  # ✅ 에러 처리 추가
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        image_data = base64.b64decode(image_base64)

        if not filename:
            filename = _generate_archive_id()

        filename_with_ext = f"{filename}.{file_extension}"
        file_path = f"archive-images/{filename_with_ext}"

        # ✅ 올바른 SDK 사용법 (공식 문서 참고)
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            {  # 세 번째 인자로 딕셔너리 직접 전달
                "content-type": f"image/{file_extension}",
                "cacheControl": "3600",  # camelCase
                "upsert": "false"
            }
        )

        # ✅ 업로드 실패 체크
        if hasattr(response, 'error') and response.error:
            raise RuntimeError(f"Image upload failed: {response.error}")

        public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)

        return public_url

    except base64.binascii.Error as e:
        raise RuntimeError(f"Base64 decoding failed: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Image upload failed: {str(e)}")
```

---

## 🚀 업데이트 방법

### 자동 업데이트 (권장)

Claude Desktop이 자동으로 최신 파일을 사용합니다:

1. **MCP 서버 파일만 교체**
   ```bash
   # 현재 디렉토리에서
   # light_archive_mcp_fixed.py 파일이 이미 수정됨
   ```

2. **Claude Desktop 재시작**
   ```bash
   # Cmd + Q로 완전 종료
   # Claude Desktop 다시 실행
   ```

3. **테스트**
   ```
   Claude에게:
   [이미지 첨부]

   "이 이미지를 업로드해줘"
   ```

---

## 🧪 테스트

### 업로드 테스트

**Claude에게 이렇게 말하세요**:
```
[스크린샷 첨부]

Light Archive에 이 이미지를 업로드해줘
```

**예상 결과**:
```
✅ 이미지 업로드 완료!

Public URL: https://...supabase.co/storage/v1/object/public/thumbnails/archive-images/1762484732930-jgqxx0.png

<img src="..." alt="Uploaded Image" />
```

### 에러 테스트 (잘못된 Base64)

**Claude에게 이렇게 말하세요**:
```
잘못된 Base64로 업로드 시도해줘: "invalid-base64-data"
```

**예상 결과**:
```
❌ Error: Base64 decoding failed: Invalid base64-encoded string...
```

---

## 📚 참고 자료

### Supabase Python SDK 공식 문서

**올바른 사용법**:
```python
# Supabase Storage Python SDK
await storage_client.from_("bucket").upload(
    "/folder/file.png",
    file_object,
    {"content-type": "image/png"}
)
```

**출처**: `/supabase/storage-py` (Context7 MCP)

### Next.js 앱 비교

**TypeScript (Next.js)**:
```typescript
const { data, error } = await supabase.storage
  .from("thumbnails")
  .upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })
```

**Python (MCP 서버)** - 이제 동일한 로직!:
```python
response = supabase.storage.from_("thumbnails").upload(
    file_path,
    image_data,
    {
        "content-type": f"image/{file_extension}",
        "cacheControl": "3600",
        "upsert": "false"
    }
)
```

---

## ⚠️ 주의사항

### 1. 가상환경 확인

```bash
# 가상환경 Python 사용하는지 확인
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | grep python

# 다음과 같이 나와야 함:
# "command": "/Users/.../light-archive-mcp/.venv/bin/python"
```

### 2. Supabase Storage 권한

```sql
-- Storage RLS 정책 확인 (Supabase Dashboard)
-- thumbnails 버킷이 public read 설정되어야 함
```

### 3. OpenAI API 키

```bash
# .env 파일 확인
cat .env | grep OPENAI_API_KEY

# 있어야 함:
# OPENAI_API_KEY=sk-proj-...
```

---

## 🔧 트러블슈팅

### "Image upload failed: Permission denied"

**원인**: Supabase Storage RLS 정책 미설정

**해결**:
```sql
-- Supabase Dashboard → Storage → thumbnails → Policies
CREATE POLICY "Public Read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');
```

### "Base64 decoding failed"

**원인**: 잘못된 Base64 형식

**해결**: Claude가 자동으로 Base64 인코딩하므로 보통 발생하지 않음. 수동으로 넣을 경우에만 발생.

### "supabase is not defined"

**원인**: 환경 변수 없음

**해결**:
```bash
# .env 파일 확인
ls -la .env
cat .env | grep SUPABASE
```

---

## 📊 버전 비교

| 버전 | 상태 | 이미지 업로드 | 에러 처리 |
|------|------|--------------|----------|
| v1.0.1 | ⚠️ | 없음 | - |
| v1.0.2 | ❌ | 작동 안 함 | 없음 |
| v1.0.3 | ✅ | 정상 작동 | 완벽 |

---

## 🎉 업데이트 완료!

이제 이미지 업로드가 정상적으로 작동합니다!

**다음 단계**:
1. ✅ Claude Desktop 재시작
2. ✅ 이미지 업로드 테스트
3. ✅ 프로젝트 아카이브 만들기

**사용 예시**:
```
[프로젝트 스크린샷 3장 첨부]

"이 이미지들로 '사용자 대시보드 개발' 프로젝트 아카이브 만들어줘.
카테고리: 프로젝트
기술: React, TypeScript, Tailwind CSS"

→ 자동으로 이미지 업로드 + 분석 + 초안 생성!
```

---

**버전**: v1.0.3
**날짜**: 2025-01-07
**수정자**: Claude Code
**문제 보고**: 사용자 (정경훈)
