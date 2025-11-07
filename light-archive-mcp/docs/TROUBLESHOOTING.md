# Light Archive MCP 서버 - 오류 해결 가이드

개발 중 발생한 모든 오류와 해결 방법을 정리한 문서입니다.

---

## 오류 1: pip/python 명령어를 찾을 수 없음

### 증상
```bash
pip install -r requirements.txt
python light_archive_mcp.py --help

# 오류 메시지
zsh: command not found: pip
zsh: command not found: python
```

### 원인
- macOS에서는 `python3`와 `pip3` 명령어를 사용해야 함
- `python`과 `pip`는 Python 2.x를 가리키거나 존재하지 않음

### 해결 방법
모든 명령어를 다음과 같이 수정:
```bash
# ❌ 잘못된 명령어
pip install -r requirements.txt
python script.py

# ✅ 올바른 명령어 (macOS)
pip3 install -r requirements.txt
python3 script.py
```

---

## 오류 2: 잘못된 데이터베이스 스키마 사용

### 증상
Supabase 쿼리 시 "table not found" 또는 "column not found" 오류 발생

### 원인
기획서의 이상적인 구조와 실제 구현이 달랐음:

| 항목 | 기획서 (잘못됨) | 실제 구현 (올바름) |
|------|----------------|-------------------|
| 테이블명 | `archives` | `archive_items` |
| 라벨 | `archive_labels` 테이블 | `tags` 배열 필드 |
| 기술 | `archive_technologies` 테이블 | `technologies` 배열 필드 |
| 분야 필드 | `field` | `sub_category` |

### 발견 과정
1. `/lib/supabase-archive.ts` 확인:
   ```typescript
   supabase.table("archive_items")  // ← 실제 테이블명
   .contains("tags", [tag])  // ← 배열 필드
   ```

2. `/types/archive.ts` 확인:
   ```typescript
   export interface BaseArchive {
     sub_category?: string  // ← field가 아님
     tags?: string[]  // ← 배열
     technologies?: string[]  // ← 배열
   }
   ```

### 해결 방법
`light_archive_mcp_fixed.py`에서 올바른 구조 사용:

```python
# ✅ 올바른 테이블명
supabase.table("archive_items")

# ✅ 올바른 Pydantic 모델
class CreateArchiveInput(BaseModel):
    title: str
    content: str
    description: str = Field(..., description="설명 (필수)")
    sub_category: Optional[str]  # field가 아님!
    tags: List[str] = []  # 배열 필드
    technologies: List[str] = []  # 배열 필드
```

**교훈**: 기획서만 보지 말고 실제 코드를 반드시 확인할 것!

---

## 오류 3: MCP 패키지 설치 실패

### 증상
```bash
pip3 install -r requirements.txt

# 오류 메시지
ERROR: Could not find a version that satisfies the requirement mcp[cli]>=0.9.0
ERROR: No matching distribution found for mcp[cli]>=0.9.0
```

### 원인
- MCP 패키지는 일반 PyPI에 없음
- `uv` 패키지 매니저를 통해서만 설치 가능

### 해결 방법

**1단계: uv 설치 확인**
```bash
which uv
# /opt/homebrew/bin/uv (있으면 OK)

# 없으면 설치
brew install uv
```

**2단계: requirements_uv.txt 사용**
```txt
# mcp를 제외한 의존성
pydantic>=2.0.0
httpx>=0.25.0
supabase>=2.0.0
openai>=1.0.0
python-dotenv>=1.0.0
```

**3단계: 가상환경에 설치**
```bash
# 가상환경 생성
uv venv

# 패키지 설치
uv pip install -r requirements_uv.txt

# MCP 별도 설치
uv pip install mcp
```

---

## 오류 4: Externally Managed Python 환경

### 증상
```bash
pip3 install 패키지명

# 오류 메시지
error: externally-managed-environment

× This environment is externally managed
╰─> The interpreter at /opt/homebrew/opt/python@3.12 is externally managed
```

### 원인
- macOS Python 3.12는 시스템 수준 패키지 설치를 막음
- PEP 668: 외부 관리 Python 환경 보호 정책

### 해결 방법
반드시 가상환경(Virtual Environment) 사용:

```bash
# uv로 가상환경 생성
uv venv

# 가상환경 활성화 (선택사항)
source .venv/bin/activate

# 가상환경에 패키지 설치
uv pip install 패키지명
```

**Claude Desktop 설정에서 가상환경 Python 사용**:
```json
{
  "mcpServers": {
    "light-archive": {
      "command": "/절대/경로/.venv/bin/python",
      "args": ["서버.py"]
    }
  }
}
```

---

## 오류 5: 환경 변수 로드 실패

### 증상
- "Supabase not initialized" 오류
- "OpenAI not initialized" 오류
- 환경 변수가 None으로 읽힘

### 원인
- `.env` 파일이 없거나 잘못된 위치
- 환경 변수명 오타 (`NEXT_PUBLIC_SUPABASE_URL` 등)

### 해결 방법

**1단계: .env 파일 확인**
```bash
cd /path/to/light-archive-mcp

# 파일 존재 확인
ls -la .env

# 내용 확인
cat .env | head -5
```

**2단계: 심볼릭 링크 생성 (권장)**
```bash
# 상위 디렉토리의 .env.local 사용
ln -sf ../.env.local .env

# 링크 확인
ls -la .env  # → ../.env.local 링크 확인
```

**3단계: 환경 변수 검증**
```python
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('Supabase URL:', os.getenv('NEXT_PUBLIC_SUPABASE_URL')[:20] + '...')
print('OpenAI Key:', 'OK' if os.getenv('OPENAI_API_KEY') else 'Missing')
"
```

---

## 오류 6: Claude Desktop에서 MCP 도구가 안 보임

### 증상
- Claude Desktop을 연결했지만 🔨 도구 아이콘이 안 보임
- "No MCP servers connected" 메시지

### 원인
1. 설정 파일 경로 오류
2. 상대 경로 사용 (절대 경로 필요)
3. Claude Desktop이 완전히 재시작되지 않음
4. 기존 대화창 사용 (새 대화 필요)

### 해결 방법

**1단계: 설정 파일 위치 확인**
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 출력 예시
{
  "mcpServers": {
    "light-archive": {
      "command": "/절대/경로/.venv/bin/python",
      "args": ["/절대/경로/light_archive_mcp_fixed.py"]
    }
  }
}
```

**중요**: 반드시 **절대 경로** 사용! 상대 경로(`.venv/bin/python`) 안 됨!

**2단계: Claude Desktop 완전 종료**
```bash
# 방법 1: Cmd + Q
# 방법 2: Activity Monitor에서 강제 종료
# 방법 3: 터미널 명령어
pkill -9 Claude
```

**3단계: 재시작 및 새 대화**
1. Claude Desktop 실행
2. **New Chat** 클릭 (기존 대화 아님!)
3. 🔨 아이콘 확인

**4단계: 테스트**
```
"Light Archive에서 프로젝트 검색해줘"
```

---

## 오류 7: "description field required" 에러

### 증상
```python
# 아카이브 생성 시 오류
ValidationError: description field required
```

### 원인
- TypeScript 타입에서는 `description?: string` (선택)
- 실제 Supabase 테이블에서는 `NOT NULL` (필수)
- 타입과 실제 DB 제약 조건이 다름

### 해결 방법
Pydantic 모델에서 description을 필수로 설정:

```python
class CreateArchiveInput(BaseModel):
    title: str
    content: str
    description: str = Field(..., description="설명 (필수)")  # ← 필수!
```

아카이브 생성 시 반드시 description 제공:
```python
await supabase.table("archive_items").insert({
    "title": "제목",
    "description": "설명",  # ← 필수!
    "content": "본문",
    ...
})
```

---

## 오류 8: "ID null 오류" (v1.0.1에서 해결됨) ✅

### 증상
```
Error: null value in column "id" violates not-null constraint
```

아카이브 생성 시 ID 필드가 null로 들어가서 오류 발생.

### 원인
- Supabase에서 ID를 자동 생성하지 않음
- Next.js 앱은 클라이언트에서 ID 생성: `${Date.now()}-${random()}`
- MCP 서버 초기 버전에서 ID 생성 로직 누락

### 해결 방법 (v1.0.1)
**업데이트됨!** MCP 서버가 자동으로 ID를 생성합니다.

**ID 패턴**:
```
타임스탬프-랜덤문자열
예: 1761901131544-a2mnqr
```

**자동 생성 방식**:
```python
def _generate_archive_id() -> str:
    timestamp = str(int(time.time() * 1000))  # 밀리초
    random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{timestamp}-{random_chars}"
```

**업데이트 방법**:
```bash
cd /path/to/light-archive-mcp

# 최신 코드 받기
git pull origin main

# 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py

# Claude Desktop 재시작
# Cmd + Q로 종료 후 재실행
```

**더 이상 수동으로 ID를 지정할 필요 없습니다!** 🎉

---

## 오류 9: "이미지 업로드 안 됨" (v1.0.2 → v1.0.3에서 해결) ✅

### 증상
```
사용자 보고: "이거 올라가지도 않아"
```

- v1.0.2에서 추가된 이미지 업로드 기능이 작동하지 않음
- `archive_upload_image` 도구 사용해도 이미지가 Supabase Storage에 안 올라감
- 에러 메시지도 없어서 무엇이 문제인지 알 수 없음

### 원인
**잘못된 Supabase Python SDK 사용법**

v1.0.2 코드 (❌ 작동 안 함):
```python
response = supabase.storage.from_("thumbnails").upload(
    file_path,
    image_data,
    file_options={  # ❌ 파라미터 이름이 틀림!
        "content-type": f"image/{file_extension}",
        "cache-control": "3600",
        "upsert": False
    }
)
```

**문제점**:
1. `file_options=` 파라미터 이름이 Python SDK에 존재하지 않음
2. TypeScript SDK와 다른 시그니처
3. 에러 처리 없어서 실패를 감지하지 못함

### 해결 방법 (v1.0.3)
**업데이트됨!** 올바른 SDK 사용법으로 수정.

v1.0.3 코드 (✅ 정상 작동):
```python
try:
    # ✅ 세 번째 인자로 딕셔너리 직접 전달
    response = supabase.storage.from_("thumbnails").upload(
        file_path,
        image_data,
        {
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

**변경 사항**:
1. ✅ 파라미터 이름 제거 (딕셔너리 직접 전달)
2. ✅ `cache-control` → `cacheControl` (camelCase)
3. ✅ try-except 블록으로 에러 처리 추가
4. ✅ 업로드 응답 검증

**업데이트 방법**:
```bash
cd /path/to/light-archive-mcp

# 최신 코드 받기 (v1.0.3)
git pull origin main

# 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py

# Claude Desktop 재시작
# Cmd + Q로 종료 후 재실행
```

**테스트**:
```
Claude에게:
[이미지 첨부]

"이 이미지를 업로드해줘"
```

**예상 결과**:
```
✅ 이미지 업로드 완료!

Public URL: https://...supabase.co/storage/v1/object/public/thumbnails/archive-images/1762484732930-jgqxx0.png
```

**참고 문서**:
- `docs/UPDATE_v1.0.3.md` - 상세 업데이트 가이드
- `docs/IMAGE_FEATURES.md` - 이미지 기능 사용법
- Supabase Storage Python SDK: `/supabase/storage-py`

**이제 이미지 업로드가 정상적으로 작동합니다!** 🎉

---

## 디버깅 체크리스트

MCP 서버가 작동하지 않을 때 순서대로 확인:

### 1. Python 환경
```bash
# ✅ Python 버전 확인
python3 --version  # 3.9 이상

# ✅ 가상환경 확인
ls -la .venv/bin/python

# ✅ 패키지 설치 확인
.venv/bin/pip list | grep -E "mcp|supabase|openai"
```

### 2. 환경 변수
```bash
# ✅ .env 파일 존재
ls -la .env

# ✅ 환경 변수 로드 테스트
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('NEXT_PUBLIC_SUPABASE_URL'))"
```

### 3. 서버 문법
```bash
# ✅ Python 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py
```

### 4. Claude Desktop 설정
```bash
# ✅ 설정 파일 확인
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# ✅ 경로가 절대 경로인지 확인
# ✅ .venv/bin/python 경로 사용 확인
```

### 5. Claude Desktop 연결
- [ ] Cmd + Q로 완전 종료
- [ ] Activity Monitor에서 Claude 프로세스 없음 확인
- [ ] 재시작
- [ ] 새 대화 시작 (기존 대화 아님!)
- [ ] 🔨 아이콘 보임

---

## 추가 도움말

### 로그 확인 방법
Claude Desktop 로그:
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log
```

### 수동 서버 테스트
```bash
# 직접 실행해보기
cd /path/to/light-archive-mcp
.venv/bin/python light_archive_mcp_fixed.py

# 오류 메시지 확인
```

### 일반적인 실수
1. ❌ 상대 경로 사용 → ✅ 절대 경로 사용
2. ❌ 시스템 Python 사용 → ✅ 가상환경 Python 사용
3. ❌ 기존 대화창 사용 → ✅ 새 대화 시작
4. ❌ .env 파일 없음 → ✅ 심볼릭 링크 생성

---

**문제가 계속되면?**
1. `INSTALL_COMPLETE.md` 다시 확인
2. 가상환경을 삭제하고 재생성: `rm -rf .venv && uv venv`
3. 모든 패키지 재설치
