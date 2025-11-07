# 🚀 Light Archive MCP - 배포 및 확장 전략

MCP 서버의 업데이트, 배포, 모듈화, 그리고 확장 전략에 대한 완전 가이드입니다.

---

## 📊 현재 상태 분석

### 현재 구조: 단일 파일 (v1.0.2)

```
light-archive-mcp/
├── light_archive_mcp_fixed.py    # 1065줄, 모든 로직 포함
├── requirements_uv.txt            # 패키지 의존성
├── .env.example                   # 환경 변수 예시
├── .venv/                         # 가상환경
└── docs/                          # 문서 (11개)
```

**light_archive_mcp_fixed.py 구조**:
```python
# 라인 1-25: Imports
# 라인 26-63: 초기화 (Supabase, OpenAI)
# 라인 64-68: 상수
# 라인 69-92: Enums (3개)
# 라인 93-232: Pydantic 모델 (12개)
# 라인 233-330: 유틸리티 함수 (7개)
# 라인 331-1057: MCP 도구 (12개)
# 라인 1058-1065: Main 실행
```

### 장점 ✅
1. **배포 간단**: 파일 하나만 복사
2. **의존성 명확**: 모든 코드가 한 곳에
3. **디버깅 쉬움**: 전체 흐름 한눈에 파악
4. **설정 간단**: Claude Desktop 설정 1줄

### 단점 ❌
1. **가독성 저하**: 1000줄 넘어가면 찾기 어려움
2. **테스트 어려움**: 함수별 단위 테스트 복잡
3. **협업 충돌**: 여러 명이 동시 수정 시 충돌
4. **재사용 불가**: 다른 프로젝트에서 함수 재사용 어려움

---

## 🎯 언제 분리해야 하는가?

### 분리 시점 (하나라도 해당되면 분리 권장)

| 기준 | 임계값 | 현재 상태 |
|------|--------|-----------|
| 총 라인 수 | 1500줄 | 1065줄 ⚠️ 곧 도달 |
| MCP 도구 개수 | 15개 | 12개 ⚠️ 곧 도달 |
| 유틸리티 함수 | 10개 | 7개 |
| Pydantic 모델 | 15개 | 12개 ⚠️ 곧 도달 |
| 파일 크기 | 50KB | 37KB |

**결론**: 현재는 괜찮지만, 도구 2-3개만 더 추가되면 **분리 권장** 🟡

---

## 📂 모듈화 전략

### Phase 1: 단순 분리 (1500줄 초과 시)

```
light-archive-mcp/
├── server.py                      # MCP 서버 메인 (100줄)
├── config.py                      # 설정 및 초기화 (50줄)
├── models.py                      # Pydantic 모델 (300줄)
├── tools/                         # MCP 도구들
│   ├── __init__.py
│   ├── crud.py                    # CRUD 도구 (200줄)
│   ├── ai.py                      # AI 도구 (200줄)
│   └── image.py                   # 이미지 도구 (300줄)
├── utils/                         # 유틸리티
│   ├── __init__.py
│   ├── supabase_helper.py         # Supabase 헬퍼 (150줄)
│   ├── openai_helper.py           # OpenAI 헬퍼 (100줄)
│   └── id_generator.py            # ID 생성 등 (50줄)
├── requirements_uv.txt
├── .env.example
├── .venv/
└── docs/
```

**예시: `server.py`**
```python
#!/usr/bin/env python3
from mcp.server.fastmcp import FastMCP
from config import supabase, openai_client
from tools import crud, ai, image

mcp = FastMCP("light_archive_mcp")

# 도구 등록
mcp.tool(crud.archive_search_archives)
mcp.tool(crud.archive_get_archive)
mcp.tool(crud.archive_create_archive)
# ... 나머지 도구들

if __name__ == "__main__":
    mcp.run()
```

**예시: `config.py`**
```python
import os
from dotenv import load_dotenv
from supabase import create_client
from openai import AsyncOpenAI

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL else None

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
```

**예시: `tools/crud.py`**
```python
from config import supabase
from models import SearchArchivesInput, GetArchiveInput
from utils.supabase_helper import check_supabase, handle_error

async def archive_search_archives(params: SearchArchivesInput) -> str:
    """아카이브 검색"""
    try:
        check_supabase()
        # 검색 로직
        return result
    except Exception as e:
        return handle_error(e)

# 나머지 CRUD 도구들...
```

### Phase 2: 고급 분리 (2000줄 초과 또는 복잡도 증가 시)

```
light-archive-mcp/
├── src/                           # 소스 코드
│   ├── __init__.py
│   ├── server.py                  # MCP 서버
│   ├── config.py                  # 설정
│   ├── constants.py               # 상수
│   ├── enums.py                   # Enum 정의
│   ├── models/                    # 데이터 모델
│   │   ├── __init__.py
│   │   ├── archive.py             # 아카이브 모델
│   │   ├── image.py               # 이미지 모델
│   │   └── ai.py                  # AI 모델
│   ├── tools/                     # MCP 도구
│   │   ├── __init__.py
│   │   ├── base.py                # 베이스 클래스
│   │   ├── crud.py
│   │   ├── ai.py
│   │   └── image.py
│   ├── services/                  # 비즈니스 로직
│   │   ├── __init__.py
│   │   ├── archive_service.py    # 아카이브 서비스
│   │   ├── image_service.py      # 이미지 서비스
│   │   └── ai_service.py          # AI 서비스
│   └── utils/                     # 유틸리티
│       ├── __init__.py
│       ├── supabase.py
│       ├── openai.py
│       ├── validators.py          # 입력 검증
│       └── formatters.py          # 출력 포맷팅
├── tests/                         # 테스트 (새로 추가!)
│   ├── __init__.py
│   ├── test_crud.py
│   ├── test_ai.py
│   ├── test_image.py
│   └── fixtures/                  # 테스트 데이터
├── scripts/                       # 유틸리티 스크립트
│   ├── migrate_db.py              # DB 마이그레이션
│   └── generate_docs.py          # 문서 자동 생성
├── requirements_uv.txt
├── requirements-dev.txt           # 개발 의존성
├── pyproject.toml                 # 프로젝트 설정
├── .env.example
├── .venv/
└── docs/
```

### Phase 3: 패키지화 (배포 및 재사용)

```
light-archive-mcp/
├── light_archive_mcp/             # 패키지 루트
│   ├── __init__.py
│   ├── __version__.py             # 버전 정보
│   ├── server.py
│   ├── config.py
│   ├── models/
│   ├── tools/
│   ├── services/
│   └── utils/
├── tests/
├── docs/
├── examples/                      # 사용 예시
│   ├── basic_usage.py
│   └── custom_tool.py
├── setup.py                       # 패키지 설정
├── pyproject.toml
├── MANIFEST.in
├── LICENSE
├── README.md
├── CHANGELOG.md
└── .github/                       # GitHub Actions
    └── workflows/
        ├── test.yml               # 자동 테스트
        └── release.yml            # 자동 릴리즈
```

---

## 🔄 업데이트 워크플로우

### 현재 (단일 파일) 방식

```mermaid
개발 → 테스트 → 커밋 → 푸시 → Claude Desktop 재시작
```

**단계별 상세**:

#### 1. 개발 단계
```bash
cd /path/to/light-archive-mcp

# 코드 수정
vi light_archive_mcp_fixed.py

# 문법 검증
python3 -m py_compile light_archive_mcp_fixed.py
```

#### 2. 테스트 단계
```bash
# 수동 테스트 (현재 방식)
# - Claude Desktop에서 직접 도구 실행
# - 결과 확인

# 또는 Python 스크립트로 간단 테스트
python3 -c "
from light_archive_mcp_fixed import _generate_archive_id
print(_generate_archive_id())
"
```

#### 3. 문서 업데이트
```bash
# CHANGELOG.md 업데이트
vi docs/CHANGELOG.md

# README.md 업데이트 (필요시)
vi README.md
```

#### 4. 버전 관리
```bash
# Git 상태 확인
git status

# 변경사항 추가
git add light_archive_mcp_fixed.py
git add docs/CHANGELOG.md

# 커밋 (Conventional Commits 형식)
git commit -m "feat(mcp): 새 기능 추가

- 기능 설명
- 변경 사항
- 영향 범위

Closes #123"
```

#### 5. 푸시 및 배포
```bash
# GitHub에 푸시
git push origin main

# Claude Desktop 재시작
# Cmd + Q → 재실행

# 새 대화에서 테스트
```

---

## 📋 업데이트 체크리스트

### 코드 변경 시

- [ ] **문법 검증**: `python3 -m py_compile light_archive_mcp_fixed.py`
- [ ] **Import 확인**: 새 모듈 추가 시 import 문 확인
- [ ] **환경 변수**: 새 환경 변수 추가 시 `.env.example` 업데이트
- [ ] **타입 힌트**: 모든 함수에 타입 힌트 추가
- [ ] **Docstring**: 각 함수/클래스에 설명 추가

### 새 도구 추가 시

- [ ] **Pydantic 모델**: 입력 모델 정의
- [ ] **@mcp.tool 데코레이터**: 올바른 annotations 설정
- [ ] **에러 핸들링**: try-except로 감싸기
- [ ] **응답 포맷**: Markdown 또는 JSON 형식 일관성
- [ ] **총 도구 개수**: README.md의 도구 개수 업데이트

### 문서 업데이트

- [ ] **CHANGELOG.md**: 버전별 변경사항 기록
- [ ] **README.md**: 새 기능 반영
- [ ] **별도 가이드**: 복잡한 기능은 별도 MD 파일 생성
- [ ] **UPDATE_v*.md**: 주요 업데이트는 별도 문서 작성

### 배포 전 확인

- [ ] **Claude Desktop 테스트**: 실제 환경에서 동작 확인
- [ ] **에러 로그**: 오류 발생 여부 확인
- [ ] **성능**: 응답 시간이 너무 오래 걸리지 않는지
- [ ] **Git 태그**: 버전 태그 추가 (v1.0.3 등)

---

## 🏗️ 모듈화 마이그레이션 가이드

### 단계 1: 백업 및 준비

```bash
cd /path/to/light-archive-mcp

# 현재 버전 백업
cp light_archive_mcp_fixed.py light_archive_mcp_fixed.py.backup

# 새 브랜치 생성
git checkout -b refactor/modularize
```

### 단계 2: 디렉토리 구조 생성

```bash
# 디렉토리 생성
mkdir -p src/{models,tools,services,utils}
mkdir -p tests

# __init__.py 생성
touch src/__init__.py
touch src/models/__init__.py
touch src/tools/__init__.py
touch src/services/__init__.py
touch src/utils/__init__.py
touch tests/__init__.py
```

### 단계 3: 코드 분리

**3.1. Enums 분리**

`src/enums.py`:
```python
from enum import Enum

class ArchiveCategory(str, Enum):
    TECH = "기술"
    PROJECT = "프로젝트"
    RESEARCH = "리서치"
    NEWS = "뉴스"

# ... 나머지 Enum들
```

**3.2. Models 분리**

`src/models/archive.py`:
```python
from pydantic import BaseModel, Field, ConfigDict
from ..enums import ArchiveCategory

class SearchArchivesInput(BaseModel):
    """아카이브 검색 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)
    query: Optional[str] = Field(None)
    # ...
```

**3.3. Utils 분리**

`src/utils/supabase.py`:
```python
from ..config import supabase

def check_supabase() -> None:
    if supabase is None:
        raise RuntimeError("Supabase not initialized")

async def upload_image_to_storage(
    image_base64: str,
    filename: Optional[str],
    file_extension: str
) -> str:
    """Base64 이미지를 Supabase Storage에 업로드"""
    # ... 로직
```

**3.4. Tools 분리**

`src/tools/crud.py`:
```python
from ..config import supabase
from ..models.archive import SearchArchivesInput
from ..utils.supabase import check_supabase

async def archive_search_archives(params: SearchArchivesInput) -> str:
    """아카이브 검색"""
    try:
        check_supabase()
        # ... 로직
    except Exception as e:
        return handle_error(e)
```

**3.5. Server 통합**

`src/server.py`:
```python
#!/usr/bin/env python3
from mcp.server.fastmcp import FastMCP
from .tools import crud, ai, image

mcp = FastMCP("light_archive_mcp")

# CRUD 도구 등록
mcp.tool(name="archive_search_archives")(crud.archive_search_archives)
mcp.tool(name="archive_get_archive")(crud.archive_get_archive)
# ... 나머지

if __name__ == "__main__":
    mcp.run()
```

### 단계 4: Claude Desktop 설정 업데이트

**Before**:
```json
{
  "command": "/path/.venv/bin/python",
  "args": ["/path/light_archive_mcp_fixed.py"]
}
```

**After (모듈화)**:
```json
{
  "command": "/path/.venv/bin/python",
  "args": ["-m", "src.server"]
}
```

### 단계 5: 테스트

```bash
# 문법 검증
python3 -m py_compile src/server.py

# 실제 실행 테스트
python3 -m src.server

# Claude Desktop 재시작 후 테스트
```

### 단계 6: 점진적 배포

```bash
# 1. 개발 브랜치에서 충분히 테스트
git add .
git commit -m "refactor: 모듈화 (단일 파일 → 구조화)"
git push origin refactor/modularize

# 2. Pull Request 생성 및 리뷰

# 3. 메인 브랜치에 병합
git checkout main
git merge refactor/modularize
git push origin main

# 4. 태그 생성
git tag -a v2.0.0 -m "Major refactor: 모듈화"
git push origin v2.0.0
```

---

## 🧪 테스트 전략

### 현재 (수동 테스트)

```
Claude Desktop → 도구 실행 → 결과 확인 → 오류 있으면 수정
```

**문제점**:
- 시간 소모
- 재현 어려움
- 회귀 테스트 불가

### 개선: 자동화 테스트

#### Unit Test 예시

`tests/test_crud.py`:
```python
import pytest
from src.tools.crud import archive_search_archives
from src.models.archive import SearchArchivesInput

@pytest.mark.asyncio
async def test_search_archives():
    """아카이브 검색 테스트"""
    params = SearchArchivesInput(
        query="test",
        limit=10
    )
    result = await archive_search_archives(params)
    assert "아카이브" in result
    assert "test" in result.lower()

@pytest.mark.asyncio
async def test_search_archives_no_results():
    """검색 결과 없음 테스트"""
    params = SearchArchivesInput(
        query="nonexistent_query_12345"
    )
    result = await archive_search_archives(params)
    assert "찾을 수 없습니다" in result or "0개" in result
```

#### Integration Test 예시

`tests/test_integration.py`:
```python
import pytest
from src.tools.image import archive_generate_draft_with_images
from src.models.image import GenerateDraftWithImagesInput
from src.enums import ArchiveCategory

@pytest.mark.asyncio
@pytest.mark.integration
async def test_full_workflow():
    """전체 워크플로우 테스트: 이미지 → 초안 → 아카이브 생성"""
    # 1. 이미지 기반 초안 생성
    params = GenerateDraftWithImagesInput(
        images_base64=["iVBORw0KGgo..."],  # 테스트 이미지
        title="테스트 아카이브",
        category=ArchiveCategory.TECH
    )
    draft_result = await archive_generate_draft_with_images(params)

    # 2. 결과 검증
    assert "✅" in draft_result
    assert "테스트 아카이브" in draft_result
    assert "http" in draft_result  # URL 포함
```

#### 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 특정 테스트만
pytest tests/test_crud.py

# 커버리지 측정
pytest --cov=src --cov-report=html

# 통합 테스트 제외 (빠른 테스트)
pytest -m "not integration"
```

---

## 📦 GitHub Actions CI/CD

### `.github/workflows/test.yml`

```yaml
name: Test MCP Server

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install uv
      run: |
        curl -LsSf https://astral.sh/uv/install.sh | sh
        echo "$HOME/.cargo/bin" >> $GITHUB_PATH

    - name: Create virtual environment
      run: uv venv

    - name: Install dependencies
      run: |
        source .venv/bin/activate
        uv pip install -r requirements_uv.txt
        uv pip install mcp pytest pytest-asyncio pytest-cov

    - name: Run syntax check
      run: |
        source .venv/bin/activate
        python -m py_compile light_archive_mcp_fixed.py

    - name: Run tests (if exists)
      run: |
        source .venv/bin/activate
        if [ -d "tests" ]; then pytest; fi

    - name: Check code formatting
      run: |
        source .venv/bin/activate
        uv pip install black
        black --check light_archive_mcp_fixed.py || true
```

### `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body: |
          Changes in this release:
          - See CHANGELOG.md for details
        draft: false
        prerelease: false
```

---

## 🔖 버전 관리 전략

### Semantic Versioning (권장)

**형식**: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.x.x): 호환성 깨지는 변경
  - 예: 단일 파일 → 모듈화
  - 예: MCP 도구 이름 변경
  - 예: Pydantic 모델 필드 제거

- **MINOR** (x.1.x): 새 기능 추가 (하위 호환)
  - 예: 새 MCP 도구 추가
  - 예: 새 옵션 추가
  - 예: 성능 개선

- **PATCH** (x.x.1): 버그 수정
  - 예: ID null 오류 수정
  - 예: 오타 수정
  - 예: 에러 메시지 개선

### 현재 버전 히스토리

```
v1.0.0 (2025-01-07) - 초기 릴리즈
  - 9개 MCP 도구
  - CRUD + AI 기능

v1.0.1 (2025-01-07) - 버그 수정
  - ID 자동 생성 기능 추가
  - ID null 오류 해결

v1.0.2 (2025-01-07) - 새 기능
  - 이미지 업로드/분석 기능
  - 3개 도구 추가 (총 12개)
```

### 다음 버전 계획 예시

```
v1.1.0 (예정)
  - [ ] 벌크 생성 기능
  - [ ] 아카이브 삭제 기능
  - [ ] 썸네일 자동 생성

v1.2.0 (예정)
  - [ ] 태그 자동 완성
  - [ ] 유사도 검색 개선
  - [ ] 캐싱 최적화

v2.0.0 (미래)
  - [ ] 모듈화 (단일 파일 → 패키지)
  - [ ] 테스트 코드 추가
  - [ ] CI/CD 구축
```

---

## 🚀 배포 플레이북

### 시나리오 1: 긴급 버그 수정 (Hotfix)

```bash
# 1. 버그 발견 및 이슈 생성
# GitHub Issue #42: "검색 시 에러 발생"

# 2. Hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/search-error

# 3. 버그 수정
vi light_archive_mcp_fixed.py
# 수정...

# 4. 테스트
python3 -m py_compile light_archive_mcp_fixed.py
# Claude Desktop에서 직접 테스트

# 5. 커밋
git add light_archive_mcp_fixed.py
git commit -m "fix(search): 검색 시 에러 수정

- 원인: None 체크 누락
- 해결: Optional 필드 검증 추가

Fixes #42"

# 6. 푸시 및 배포
git push origin hotfix/search-error

# 7. Pull Request 생성 및 리뷰

# 8. 메인에 병합
git checkout main
git merge hotfix/search-error

# 9. 패치 버전 업
# v1.0.2 → v1.0.3
git tag -a v1.0.3 -m "Hotfix: 검색 에러 수정"
git push origin main --tags

# 10. CHANGELOG.md 업데이트
```

### 시나리오 2: 새 기능 추가

```bash
# 1. Feature 브랜치 생성
git checkout -b feature/bulk-create

# 2. 기능 개발
vi light_archive_mcp_fixed.py
# Pydantic 모델 추가
# MCP 도구 추가

# 3. 문서 작성
vi docs/BULK_CREATE.md
# 사용 방법 설명

# 4. CHANGELOG 업데이트
vi docs/CHANGELOG.md
# v1.1.0 섹션 추가

# 5. 테스트
python3 -m py_compile light_archive_mcp_fixed.py
# Claude Desktop 테스트

# 6. 커밋
git add .
git commit -m "feat(mcp): 벌크 생성 기능 추가

- archive_bulk_create 도구 추가
- 최대 10개 아카이브 동시 생성
- 진행 상황 표시
- 에러 발생 시 롤백 지원

총 13개 도구 (v1.1.0)"

# 7. 푸시 및 PR
git push origin feature/bulk-create
# GitHub에서 PR 생성

# 8. 리뷰 후 병합
git checkout main
git merge feature/bulk-create

# 9. 마이너 버전 업
# v1.0.3 → v1.1.0
git tag -a v1.1.0 -m "Feature: 벌크 생성 기능"
git push origin main --tags

# 10. GitHub Release 작성
```

### 시나리오 3: 메이저 리팩토링 (모듈화)

```bash
# 1. 계획 수립
# - 목표: 단일 파일 → 모듈 구조
# - 기간: 2주
# - 호환성: 기존 사용자에게 영향 최소화

# 2. 개발 브랜치 생성
git checkout -b refactor/v2.0

# 3. 점진적 리팩토링
# 3.1. 디렉토리 생성
mkdir -p src/{models,tools,utils}

# 3.2. 코드 분리 (1주)
# - Enums 분리
# - Models 분리
# - Utils 분리
# - Tools 분리

# 3.3. 테스트 코드 작성 (3일)
mkdir tests
vi tests/test_*.py

# 3.4. 문서 업데이트 (2일)
vi docs/MIGRATION_v2.md
vi docs/ARCHITECTURE.md

# 4. 통합 테스트
pytest
# Claude Desktop 테스트
# 모든 기능 검증

# 5. 마이그레이션 가이드 작성
vi docs/MIGRATION_v2.md
# v1.x → v2.0 업그레이드 방법

# 6. 베타 릴리즈
git tag -a v2.0.0-beta.1 -m "Beta: 모듈화 버전"
git push origin v2.0.0-beta.1

# 7. 피드백 수집 (1주)
# - 조기 사용자 테스트
# - 버그 수정
# - 문서 개선

# 8. 정식 릴리즈
git tag -a v2.0.0 -m "Major: 모듈화 아키텍처"
git push origin main --tags

# 9. 마이그레이션 지원
# - v1.x 유지 보수 (6개월)
# - v2.0 안정화
# - 사용자 마이그레이션 도움
```

---

## 📊 확장 로드맵

### 단기 (v1.x) - 현재 구조 유지

**목표**: 기능 추가, 안정성 향상

| 버전 | 기능 | 예상 라인 수 |
|------|------|--------------|
| v1.1.0 | 벌크 생성, 삭제 기능 | ~1200줄 |
| v1.2.0 | 태그 자동완성, 캐싱 | ~1350줄 |
| v1.3.0 | 통계, 대시보드 데이터 | ~1500줄 ⚠️ |

**v1.3.0에서 1500줄 초과 예상 → v2.0.0으로 모듈화 권장**

### 중기 (v2.x) - 모듈화

**목표**: 유지보수성, 테스트 가능성

```
v2.0.0 (모듈화 기반)
  - 구조 개편
  - 테스트 코드
  - CI/CD 구축

v2.1.0 - v2.5.0
  - 새 기능 계속 추가
  - 각 모듈 독립 발전
  - 플러그인 시스템 검토
```

### 장기 (v3.x) - 플랫폼화

**목표**: 확장 가능한 플랫폼

```
v3.0.0
  - 플러그인 시스템
  - 커스텀 도구 지원
  - 멀티 프로젝트 지원

v4.0.0
  - 웹 대시보드
  - REST API
  - 독립 서비스화
```

---

## 💡 Best Practices

### 1. Commit Message 규칙

**Conventional Commits 사용**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서만 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

**예시**:
```bash
git commit -m "feat(image): 이미지 압축 기능 추가

- 업로드 전 자동 압축 (최대 1MB)
- WebP 변환 옵션
- 품질 조절 가능

Closes #45"
```

### 2. 브랜치 전략

```
main (v1.0.2)
  ├── develop (최신 개발 버전)
  ├── feature/new-feature (새 기능)
  ├── hotfix/urgent-bug (긴급 수정)
  └── refactor/modularize (리팩토링)
```

### 3. 코드 리뷰 체크리스트

- [ ] 코드가 동작하는가?
- [ ] 에러 처리가 적절한가?
- [ ] 문서가 업데이트되었는가?
- [ ] 성능 문제는 없는가?
- [ ] 기존 기능이 깨지지 않는가?

### 4. 릴리즈 체크리스트

- [ ] 모든 테스트 통과
- [ ] 문법 검증 완료
- [ ] CHANGELOG.md 업데이트
- [ ] README.md 업데이트 (필요시)
- [ ] 버전 태그 생성
- [ ] GitHub Release 작성
- [ ] 사용자에게 알림 (breaking changes 있을 때)

---

## 🎯 결론

### 현재 상태 (v1.0.2)
- ✅ 단일 파일, 1065줄
- ✅ 12개 MCP 도구
- ✅ 빠른 배포 및 수정 가능
- ⚠️ 곧 1500줄 도달 예상

### 권장사항

#### 지금 (v1.0.x - v1.3.0)
**단일 파일 유지**
- 기능 계속 추가
- 문서 충실히 작성
- 버전 관리 철저히

#### 1500줄 도달 시 (v2.0.0)
**모듈화 시작**
- Phase 1 구조로 분리
- 테스트 코드 작성
- CI/CD 구축

#### 2000줄 도달 시 (v2.5.0+)
**고급 구조로 전환**
- Phase 2 구조 적용
- 서비스 레이어 분리
- 플러그인 시스템 검토

### 최종 조언

1. **너무 일찍 최적화하지 마세요**
   - 현재 구조로 충분합니다
   - 복잡해질 때 리팩토링

2. **문서를 살아있게 유지하세요**
   - 코드보다 문서가 중요
   - 업데이트 시 반드시 문서도 갱신

3. **버전 관리를 철저히**
   - Semantic Versioning 준수
   - CHANGELOG.md 꼼꼼히 작성

4. **사용자 피드백을 경청하세요**
   - 실제 사용 패턴 파악
   - 필요한 기능 우선 개발

---

**Happy Coding!** 🚀
