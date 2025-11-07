# Light Archive MCP 서버 - 빠른 시작 가이드

## 🚀 3분 안에 시작하기

### 1️⃣ 환경 변수 설정 (30초)

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp

# 상위 디렉토리의 .env.local을 링크
ln -s ../.env.local .env

# 확인
cat .env | head -3
```

### 2️⃣ 패키지 설치 (1-2분)

```bash
# pip3 사용! (macOS는 pip가 아님)
pip3 install -r requirements.txt
```

### 3️⃣ 테스트 (30초)

```bash
# 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py

# 환경 변수 확인
python3 -c "from dotenv import load_dotenv; import os; load_dotenv(); print('✅ Supabase:', 'OK' if os.getenv('NEXT_PUBLIC_SUPABASE_URL') else '❌'); print('✅ OpenAI:', 'OK' if os.getenv('OPENAI_API_KEY') else '❌')"
```

### 4️⃣ Claude Desktop 연동 (1분)

**macOS 설정 파일**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "light-archive": {
      "command": "/usr/bin/python3",
      "args": [
        "/Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/light_archive_mcp_fixed.py"
      ]
    }
  }
}
```

**중요**: 환경 변수는 `.env` 파일에서 자동으로 로드됩니다!

Claude Desktop 재시작 → 🔨 아이콘 확인!

---

## ✨ 바로 시도해보기

Claude에게 이렇게 말해보세요:

### 시나리오 1: 검색
```
"Light Archive에서 Vision 관련 프로젝트 찾아줘"
```

### 시나리오 2: AI 초안 생성
```
"GPT-4 활용한 챗봇 프로젝트 아카이브 초안 만들어줘.
분야는 Generative AI이고, React와 FastAPI 사용해."
```

### 시나리오 3: 전체 워크플로우
```
"다음 내용으로 아카이브 만들어줘:
- 제목: Claude MCP를 활용한 업무 자동화
- 카테고리: 프로젝트
- 분야: AI Automation
- 기술: Claude API, Python, MCP

초안도 AI로 생성하고, 태그도 자동으로 추천해줘."
```

---

## 🎯 주요 기능 9개

| 도구 | 설명 | AI 사용 |
|------|------|---------|
| archive_search_archives | 전체 검색 | ❌ |
| archive_get_archive | 상세 조회 | ❌ |
| archive_create_archive | 생성 | ❌ |
| archive_update_archive | 수정 | ❌ |
| **archive_generate_draft** | **AI 초안 생성** | ✅ |
| **archive_generate_summary** | **AI 요약** | ✅ |
| **archive_suggest_tags** | **AI 태그 추천** | ✅ |
| archive_find_related | 유사 항목 추천 | ❌ |
| archive_list_archives | 목록 조회 | ❌ |

---

## 🐛 문제 발생 시

### "command not found: pip"
→ `pip3`를 사용하세요! (macOS)

### "Supabase not initialized"
→ `.env` 파일이 있는지 확인: `ls -la .env`

### "OpenAI not initialized"
→ `.env` 파일에 OPENAI_API_KEY가 있는지 확인

### Claude Desktop에서 도구가 안 보임
1. 설정 파일 경로 확인: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. 절대 경로 확인: `/usr/bin/python3`, `/Users/jeong-gyeonghun/...`
3. Claude Desktop 완전 종료 후 재시작
4. 새 대화 시작

---

## 📚 더 자세한 가이드

- **SETUP_GUIDE.md**: 완전한 설치 및 사용 가이드
- **README.md**: 프로젝트 개요 및 도구 설명

---

## 💡 팁

1. **AI 기능 활용**: 초안, 요약, 태그를 AI가 자동 생성하니 시간 절약!
2. **워크플로우 자동화**: 회의록 → 아카이브 자동 변환
3. **검색 최적화**: 태그와 기술 스택 기반 스마트 추천 활용

---

**다 됐어요! 🎉 이제 Claude와 대화하며 Light Archive를 관리해보세요!**
