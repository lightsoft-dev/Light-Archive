# Light Archive MCP Server (v1.0.7)

✅ **실제 프로젝트 구조에 맞게 수정된 버전입니다!**

## 📦 파일 구조

```
light-archive-mcp/
├── light_archive_mcp_fixed.py  ⭐ MCP 서버 (v1.0.7)
├── requirements_uv.txt         📋 패키지 의존성
├── .env.example                🔐 환경 변수 예시
├── .venv/                      🐍 Python 가상환경 (Python 3.14)
├── docs/                       📚 문서 모음
│   ├── QUICKSTART.md           🚀 3분 빠른 시작
│   ├── SETUP_GUIDE.md          📖 완전한 설치 가이드
│   ├── INSTALL_COMPLETE.md     ✅ 설치 완료 후 가이드
│   ├── START_HERE.md           🎯 여기서 시작
│   ├── TROUBLESHOOTING.md      🐛 오류 해결 가이드
│   ├── CHANGELOG.md            📝 버전 변경 이력
│   ├── GITHUB_STRATEGY.md      🚀 GitHub 배포 전략
│   └── READY_FOR_GITHUB.md     ✅ GitHub 푸시 준비
└── README.md                   📄 이 파일
```

## 🎯 핵심 특징

- **올바른 DB 구조**: 실제 `archive_items` 테이블 사용
- **PostgreSQL 배열**: `tags[]`, `technologies[]` 필드 지원
- **MCP 프로토콜**: Claude와 자연어로 대화하며 아카이브 관리
- **자동 ID 생성**: Next.js 앱과 동일한 패턴으로 ID 자동 생성
- **HTML 콘텐츠**: content 필드를 HTML 형식으로 작성

## 🚀 빠른 시작

### 자동 설치 (이미 완료됨!)
가상환경과 모든 패키지가 설치되어 있습니다.

### Claude Desktop 연동
`~/Library/Application Support/Claude/claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "light-archive": {
      "command": "/Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/.venv/bin/python",
      "args": [
        "/Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/light_archive_mcp_fixed.py"
      ]
    }
  }
}
```

**중요**: 가상환경의 Python 경로(`.venv/bin/python`)를 사용하세요!

### 테스트
1. Claude Desktop 완전 종료 (`Cmd + Q`)
2. 재시작
3. 새 대화에서: **"Light Archive에서 프로젝트 검색해줘"**

자세한 내용은 **`docs/INSTALL_COMPLETE.md`** 참고!

## ✨ 주요 기능

### 기본 CRUD (4개)
- `archive_search_archives` - 전체 검색
- `archive_get_archive` - 상세 조회
- `archive_create_archive` - 생성
- `archive_update_archive` - 수정

### 추가 기능 (2개)
- `archive_find_related` - 유사 항목 추천
- `archive_list_archives` - 목록 조회

**총 6개 도구** (v1.0.7)

> **참고**: AI 초안/요약/태그 생성 도구와 이미지 도구는 v1.0.7에서 제거되었습니다.
> Claude가 직접 작성하거나, Next.js 앱(archive.lightsoft.dev)에서 이미지를 업로드하세요.

## 📊 실제 데이터베이스 구조

```sql
-- archive_items 테이블
CREATE TABLE archive_items (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,        -- 설명 (필수)
  excerpt TEXT,                     -- 요약문
  content TEXT,                     -- 본문
  category TEXT,                    -- "기술"|"프로젝트"|"리서치"|"뉴스"
  sub_category TEXT,                -- 서브 카테고리/분야
  status TEXT DEFAULT 'draft',      -- "draft"|"published"|"archived"

  tags TEXT[],                      -- 태그 배열!
  technologies TEXT[],              -- 기술 스택 배열!

  difficulty TEXT,
  author TEXT,
  thumbnail_url TEXT,
  image TEXT,

  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP
);
```

## 💡 사용 예시

### Claude에게 이렇게 말하세요:

#### 기본 검색 및 생성
```
"Light Archive에서 Vision 관련 프로젝트 찾아줘"

"GPT-4 활용한 챗봇 프로젝트 아카이브 만들어줘.
초안도 AI로 생성하고, 태그도 자동으로 추천해줘."

"이 아카이브(ID: xxx)와 비슷한 다른 프로젝트 알려줘"
```

#### 이미지 포함 작업
```
"이 프로젝트 아카이브 만들어줘.
이미지는 archive.lightsoft.dev에서 직접 업로드할게."
```

## 🔧 문제 해결

### macOS에서 pip/python 안 됨
→ `pip3`와 `python3`를 사용하세요!

```bash
python3 --version
pip3 install -r requirements_uv.txt
```

### .venv 심볼릭 링크 깨짐 (Python 업그레이드 후)
→ Python 버전이 바뀌면 `.venv`를 다시 만들어야 합니다.

```bash
rm -rf .venv
python3 -m venv .venv
.venv/bin/pip install -r requirements_uv.txt
.venv/bin/pip install mcp
```

### Supabase 연결 실패
→ `.env` 파일 확인

```bash
ls -la .env
cat .env | grep SUPABASE
```

### OpenAI API 에러
→ API 키 확인

```bash
cat .env | grep OPENAI
```

## 📚 문서 가이드

| 문서 | 내용 | 추천 |
|------|------|------|
| **docs/START_HERE.md** | 여기서 시작! | ⭐ 필수 |
| **docs/QUICKSTART.md** | 3분 빠른 시작 | ⭐ 추천 |
| **docs/INSTALL_COMPLETE.md** | 설치 완료 후 가이드 | ⭐ 추천 |
| **docs/SETUP_GUIDE.md** | 완전한 설치 가이드 | 상세 |
| **docs/TROUBLESHOOTING.md** | 오류 해결 가이드 | 문제 발생 시 |
| **docs/CHANGELOG.md** | 버전 변경 이력 | 참고 |

## ⚠️ 주의사항

1. **가상환경 Python 사용**: `.venv/bin/python` (시스템 Python 아님!)
2. **절대 경로 사용**: Claude Desktop 설정에서 상대 경로 사용 금지
3. **환경 변수**: `.env` 파일이 심볼릭 링크로 연결되어 있어야 함
4. **Claude Desktop 재시작**: 설정 변경 후 완전 종료(`Cmd + Q`) 후 재시작

## 🎉 시작하기

**설치 완료! 이제 Claude Desktop과 연동하세요!**

**다음 단계**:
1. 📖 `docs/INSTALL_COMPLETE.md` 읽기
2. ⚙️ Claude Desktop 설정
3. 🔄 Claude Desktop 재시작
4. 🚀 테스트: "Light Archive에서 프로젝트 검색해줘"
