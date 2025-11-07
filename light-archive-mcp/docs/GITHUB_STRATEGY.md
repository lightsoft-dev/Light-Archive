# Light Archive MCP - GitHub 배포 전략

현재 상황: `clean-blog-archive` 프로젝트가 `lightsoft-dev/Light-Archive` 레포와 연동되어 있고 CI/CD가 설정되어 있음

---

## 📊 전략 비교

| 전략 | 장점 | 단점 | 추천도 |
|------|------|------|--------|
| **옵션 1: 같은 레포 포함 (모노레포)** | • 관리 편함<br>• 문서 공유 가능<br>• 이슈 통합 관리 | • 레포 크기 증가<br>• CI/CD 설정 필요 | ⭐⭐⭐⭐⭐ |
| **옵션 2: 별도 레포 분리** | • 독립적 버전 관리<br>• 권한 분리 가능 | • 관리 복잡<br>• 문서 동기화 어려움 | ⭐⭐⭐ |
| **옵션 3: Git Submodule** | • 레포 분리 + 연결<br>• 버전 고정 가능 | • Submodule 복잡<br>• 클론 시 추가 작업 | ⭐⭐ |

---

## ✅ 권장: 옵션 1 (같은 레포에 포함)

### 이유
1. **MCP 서버는 Light Archive의 확장 기능**
   - 프로젝트와 밀접하게 연관됨
   - 같은 Supabase DB 사용
   - 문서와 이슈를 통합 관리 가능

2. **CI/CD 영향 최소화 가능**
   - `.gitignore`로 Python 관련 파일 제외
   - Vercel 빌드는 Next.js만 처리 (Python 무시)
   - 별도 경로라 충돌 없음

3. **사용자 접근성**
   - 레포 하나만 클론하면 전체 시스템 사용 가능
   - README에서 MCP 서버 설명 추가 가능

---

## 🚀 옵션 1 구현 방법

### 1단계: `.gitignore` 업데이트

```bash
cd /Users/jeong-gyeonghun/Downloads/clean-blog-archive
```

**`.gitignore`에 추가**:
```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python

# Virtual environments (중요!)
.venv/
venv/
ENV/
env/

# MCP specific (이미 .env* 제외되어 있음)
light-archive-mcp/.env
```

**현재 `.gitignore`에 이미 `.env*`가 있어서 환경 변수는 자동으로 제외됨**

### 2단계: Git에 추가

```bash
# 현재 상태 확인
git status

# MCP 폴더 추가 (선택적)
git add light-archive-mcp/

# 또는 파일별로 추가 (더 안전)
git add light-archive-mcp/README.md
git add light-archive-mcp/light_archive_mcp_fixed.py
git add light-archive-mcp/requirements_uv.txt
git add light-archive-mcp/.env.example
git add light-archive-mcp/docs/

# .venv와 .env가 제외되었는지 확인
git status  # .venv가 안 보여야 함!
```

### 3단계: 커밋 및 푸시

```bash
# 커밋
git commit -m "feat: Light Archive MCP 서버 추가

- Claude와 자연어로 아카이브 관리 가능
- AI 기반 초안/요약/태그 자동 생성
- Supabase 연동 9개 도구 제공
- 설치 및 사용 가이드 포함"

# 푸시
git push origin main
```

### 4단계: CI/CD 확인

Vercel이나 다른 CI/CD 시스템이 Python 파일로 인해 영향받는지 확인:

**예상 결과**:
- ✅ Next.js 빌드는 정상 진행 (Python 무시)
- ✅ Vercel은 `package.json` 기반으로만 빌드
- ✅ `light-archive-mcp/` 폴더는 배포에 포함되지만 실행 안 됨 (문제없음)

**만약 문제가 생긴다면**:
```json
// vercel.json 추가
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- './(app|components|lib|public)'"
}
```

---

## 📝 옵션 2: 별도 레포로 분리 (선택적)

### 언제 사용?
- MCP 서버를 다른 팀/프로젝트에서도 사용할 때
- 독립적인 버전 관리가 필요할 때
- 권한을 분리하고 싶을 때

### 구현 방법

```bash
# 1. 새 레포 생성
cd /Users/jeong-gyeonghun/Downloads/
cp -r clean-blog-archive/light-archive-mcp light-archive-mcp-standalone

cd light-archive-mcp-standalone

# 2. Git 초기화
git init
git add .
git commit -m "Initial commit: Light Archive MCP Server"

# 3. GitHub에 새 레포 생성 후 연결
git remote add origin https://github.com/lightsoft-dev/light-archive-mcp.git
git branch -M main
git push -u origin main
```

### 원본 레포에서 링크 추가

**`clean-blog-archive/README.md`에 추가**:
```markdown
## 🤖 MCP 서버 (별도 레포)

Claude AI를 통해 자연어로 아카이브를 관리하고 싶다면:
[Light Archive MCP Server](https://github.com/lightsoft-dev/light-archive-mcp)
```

### 단점
- 두 레포 모두 관리 필요
- 이슈가 분산됨
- 문서 동기화 필요

---

## 📋 체크리스트

### 공통 (어떤 옵션이든)
- [ ] `.venv/` 폴더가 Git에 포함되지 않는지 확인
- [ ] `.env` 파일이 Git에 포함되지 않는지 확인 (이미 제외됨)
- [ ] `__pycache__/`가 Git에 포함되지 않는지 확인
- [ ] README.md에 MCP 서버 사용법 링크 추가
- [ ] 라이센스 파일 확인 (MIT, Apache 등)

### 옵션 1 (같은 레포)
- [ ] `.gitignore`에 Python 관련 패턴 추가
- [ ] CI/CD가 Python 파일로 영향받지 않는지 테스트
- [ ] 프로젝트 루트 README에 MCP 서버 섹션 추가

### 옵션 2 (별도 레포)
- [ ] 새 GitHub 레포 생성
- [ ] 원본 레포에 링크 추가
- [ ] 각 레포의 README 업데이트

---

## 🔒 보안 고려사항

### 절대 커밋하면 안 되는 것들
- ❌ `.env` 파일 (API 키, DB 비밀번호 포함)
- ❌ `.venv/` 폴더 (용량 크고, 환경별로 다름)
- ❌ `__pycache__/` (Python 캐시)
- ❌ `.env.local` (이미 제외됨)

### 안전하게 공유해도 되는 것들
- ✅ `.env.example` (예시 파일, 실제 값 없음)
- ✅ `light_archive_mcp_fixed.py` (소스 코드)
- ✅ `requirements_uv.txt` (패키지 목록)
- ✅ `docs/` (문서)
- ✅ `README.md`

---

## 📦 프로젝트 구조 (GitHub에 올라갈 모습)

```
Light-Archive/                    # GitHub 레포
├── app/                          # Next.js 앱
├── components/                   # React 컴포넌트
├── lib/                          # 유틸리티
├── public/                       # 정적 파일
├── docs/                         # 프로젝트 문서
├── light-archive-mcp/            # ⭐ MCP 서버 (새로 추가)
│   ├── light_archive_mcp_fixed.py
│   ├── requirements_uv.txt
│   ├── .env.example              # 예시만 (실제 .env는 제외)
│   ├── docs/
│   │   ├── START_HERE.md
│   │   ├── QUICKSTART.md
│   │   ├── INSTALL_COMPLETE.md
│   │   ├── SETUP_GUIDE.md
│   │   └── TROUBLESHOOTING.md
│   └── README.md
├── .gitignore                    # 업데이트 필요
├── package.json
├── next.config.mjs
└── README.md                     # MCP 서버 섹션 추가

# 제외되는 것들 (.gitignore)
# - light-archive-mcp/.venv/
# - light-archive-mcp/.env
# - light-archive-mcp/__pycache__/
```

---

## 📖 사용자 관점에서의 경험

### 같은 레포에 포함 시 (권장)
```bash
# 1. 레포 클론
git clone https://github.com/lightsoft-dev/Light-Archive.git
cd Light-Archive

# 2. Next.js 설치 및 실행
pnpm install
pnpm dev

# 3. MCP 서버도 사용하고 싶다면
cd light-archive-mcp
uv venv
uv pip install -r requirements_uv.txt
uv pip install mcp
ln -s ../.env.local .env
# Claude Desktop 설정...
```

**장점**: 한 번 클론으로 모든 기능 사용 가능!

### 별도 레포로 분리 시
```bash
# 1. 메인 프로젝트 클론
git clone https://github.com/lightsoft-dev/Light-Archive.git

# 2. MCP 서버는 별도 클론 (원한다면)
git clone https://github.com/lightsoft-dev/light-archive-mcp.git
```

**단점**: 두 레포를 따로 관리해야 함

---

## 🎯 최종 권장사항

### ⭐ 옵션 1 선택 이유

1. **관리 편의성**: 하나의 레포에서 모든 것 관리
2. **문서 통합**: MCP 사용법을 메인 README에 추가 가능
3. **CI/CD 영향 없음**: Vercel은 Next.js만 빌드
4. **사용자 편의**: 한 번 클론으로 전체 기능 사용

### 구현 순서

```bash
# 1. .gitignore 업데이트
echo "
# Python
__pycache__/
*.py[cod]
.venv/
venv/
" >> .gitignore

# 2. Git 상태 확인
git status

# 3. MCP 폴더 추가 (안전하게)
git add light-archive-mcp/README.md
git add light-archive-mcp/light_archive_mcp_fixed.py
git add light-archive-mcp/requirements_uv.txt
git add light-archive-mcp/.env.example
git add light-archive-mcp/docs/

# 4. .venv가 제외되었는지 재확인!
git status | grep venv  # 아무것도 안 나와야 함

# 5. 커밋
git commit -m "feat: Light Archive MCP 서버 추가"

# 6. 푸시
git push origin main

# 7. CI/CD 확인
# GitHub Actions 또는 Vercel 빌드 로그 확인
```

---

## 💡 추가 팁

### README.md에 추가할 섹션 (메인 프로젝트)

```markdown
## 🤖 AI 기반 관리 (MCP 서버)

Claude AI를 통해 자연어로 아카이브를 관리할 수 있습니다.

**주요 기능**:
- 🔍 자연어로 아카이브 검색
- ✍️ AI 기반 초안 자동 생성
- 🏷️ 태그 자동 추천
- 📝 내용 자동 요약

**시작하기**: [`light-archive-mcp/docs/START_HERE.md`](./light-archive-mcp/docs/START_HERE.md)
```

### GitHub 릴리즈 태그

```bash
# MCP 서버 버전 태그
git tag -a mcp-v1.0.0 -m "Light Archive MCP Server v1.0.0"
git push origin mcp-v1.0.0
```

---

**결론**: 옵션 1 (같은 레포 포함)을 권장하며, 위의 구현 순서를 따르면 안전하게 GitHub에 배포할 수 있습니다! 🚀
