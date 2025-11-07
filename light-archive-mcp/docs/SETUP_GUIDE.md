# Light Archive MCP 서버 설치 및 사용 가이드

## 📋 개요

이 MCP 서버는 실제 Light Archive 프로젝트(`archive_items` 테이블)와 완벽하게 호환됩니다.

## 🔧 1단계: Python 환경 확인

macOS에서는 `python3`와 `pip3`를 사용합니다:

```bash
# 버전 확인
python3 --version
pip3 --version

# Python 3.9 이상이어야 합니다
```

## 📦 2단계: 패키지 설치

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp

# 패키지 설치
pip3 install -r requirements.txt
```

**주의**: `pip` 대신 `pip3`를 사용하세요!

## ⚙️ 3단계: 환경 변수 설정

이미 상위 디렉토리에 `.env.local` 파일이 있습니다! 이를 복사하거나 링크하세요:

### 방법 1: 심볼릭 링크 (권장)

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp
ln -s ../.env.local .env

# 확인
ls -la .env
```

### 방법 2: 복사

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp
cp ../.env.local .env
```

### 환경 변수 확인

`.env` 파일에 다음이 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tjucmfulpsbarmmxfeao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

## 🧪 4단계: 동작 테스트

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp

# Python 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py

# 환경 변수 로드 테스트
python3 -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('Supabase URL:', os.getenv('NEXT_PUBLIC_SUPABASE_URL'))
print('OpenAI Key:', 'OK' if os.getenv('OPENAI_API_KEY') else 'Missing')
"
```

## 🎮 5단계: MCP Inspector로 테스트 (권장)

MCP Inspector를 사용하면 각 도구를 직접 테스트할 수 있습니다:

```bash
# uv가 설치되어 있다면
uv run mcp dev light_archive_mcp_fixed.py

# 또는 python-mcp CLI 사용
mcp dev light_archive_mcp_fixed.py
```

MCP Inspector에서:
1. `archive_search_archives` 도구 선택
2. 파라미터 입력:
   ```json
   {
     "query": "Vision",
     "category": "프로젝트"
   }
   ```
3. "Call Tool" 클릭 → 실제 데이터베이스에서 검색 결과 확인!

## 🤖 6단계: Claude Desktop 연동

### A. 자동 설치 (추천)

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp
uv run mcp install light_archive_mcp_fixed.py
```

### B. 수동 설정

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json` 파일 편집

```json
{
  "mcpServers": {
    "light-archive": {
      "command": "/usr/bin/python3",
      "args": [
        "/Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/light_archive_mcp_fixed.py"
      ],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "https://tjucmfulpsbarmmxfeao.supabase.co",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGci...",
        "OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

**주의**:
- `command`는 `/usr/bin/python3` (절대 경로)
- `args`는 스크립트 절대 경로
- 환경 변수는 실제 값으로 교체

### C. Claude Desktop 재시작

1. Claude Desktop 완전 종료
2. 다시 시작
3. 새 대화 시작
4. 🔨 아이콘(도구)이 보이면 성공!

## 💡 사용 예시

### 예시 1: 아카이브 검색

```
당신: "Light Archive에서 Vision 관련 프로젝트 찾아줘"

Claude: [archive_search_archives 도구 사용]
        → "Computer Vision 기반 객체 인식" 등 결과 반환
```

### 예시 2: AI 초안 생성 → 아카이브 생성

```
당신: "GPT-4 활용한 챗봇 프로젝트 아카이브 만들어줘"

Claude:
1. [archive_generate_draft] → AI가 초안 생성
2. [archive_suggest_tags] → 태그 자동 추천
3. [archive_create_archive] → 아카이브 생성

→ "✅ 아카이브 생성 완료! ID: xxx-yyy-zzz"
```

### 예시 3: 유사 아카이브 추천

```
당신: "ID가 abc-123인 아카이브랑 비슷한 거 찾아줘"

Claude: [archive_find_related]
        → 같은 태그/기술 스택 기반 유사 항목 추천
```

## 🔍 주요 도구 목록

1. **archive_search_archives** - 전체 검색
2. **archive_get_archive** - 상세 조회
3. **archive_create_archive** - 생성
4. **archive_update_archive** - 수정
5. **archive_generate_draft** - AI 초안 생성 ⭐
6. **archive_generate_summary** - AI 요약 ⭐
7. **archive_suggest_tags** - AI 태그 추천 ⭐
8. **archive_find_related** - 유사 항목 추천
9. **archive_list_archives** - 목록 조회

## 🐛 문제 해결

### 1. "command not found: python"

**해결**: `python3`를 사용하세요
```bash
python3 --version
pip3 install -r requirements.txt
```

### 2. "Supabase not initialized"

**원인**: 환경 변수가 로드되지 않음

**해결**:
```bash
# .env 파일 확인
cat /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/.env

# 없으면 생성
ln -s ../.env.local .env
```

### 3. "OpenAI not initialized"

**원인**: OPENAI_API_KEY가 없음

**해결**: `.env` 파일에 OpenAI API 키 추가
```env
OPENAI_API_KEY=sk-proj-your-key-here
```

### 4. "relation 'archives' does not exist"

**원인**: 잘못된 서버 버전 사용

**해결**: 반드시 `light_archive_mcp_fixed.py`를 사용하세요! (`.env`에서 `archive_items` 테이블 사용)

## 📊 실제 데이터베이스 구조

```typescript
// archive_items 테이블
{
  id: string                  // UUID
  title: string               // 제목
  description: string         // 설명 (필수!)
  excerpt: string            // 요약문
  content: string            // 본문 (HTML/Markdown)
  category: string           // "기술" | "프로젝트" | "리서치" | "뉴스"
  sub_category: string       // 서브 카테고리/분야
  status: string             // "draft" | "published" | "archived"

  tags: string[]             // 태그 배열 (PostgreSQL array)
  technologies: string[]     // 기술 스택 배열

  difficulty: string
  author: string
  thumbnail_url: string

  view_count: number
  comment_count: number

  created_at: timestamp
  updated_at: timestamp
  published_at: timestamp
}
```

## ✅ 체크리스트

설정 완료 확인:

- [ ] Python 3.9+ 설치 확인 (`python3 --version`)
- [ ] 패키지 설치 (`pip3 install -r requirements.txt`)
- [ ] `.env` 파일 생성 (심볼릭 링크 또는 복사)
- [ ] 환경 변수 로드 테스트
- [ ] Python 문법 검증 (`python3 -m py_compile`)
- [ ] MCP Inspector 테스트 (선택사항)
- [ ] Claude Desktop 설정 및 재시작
- [ ] 실제 도구 테스트 (검색, 생성 등)

## 🎯 다음 단계

1. **Claude Desktop에서 테스트**: 실제로 아카이브 검색해보기
2. **AI 기능 활용**: 초안 생성, 요약, 태그 추천 시도
3. **자동화 워크플로우**: 회의록 → 아카이브 자동 변환 등

## 💬 궁금한 점?

- MCP 프로토콜: https://modelcontextprotocol.io/
- Supabase 문서: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
