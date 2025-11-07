# 🎯 Light Archive MCP - 여기서 시작하세요!

## ⚡ 1분 요약

1. **환경 변수 설정** (이미 있음!)
   ```bash
   cd light-archive-mcp
   ln -s ../.env.local .env
   ```

2. **패키지 설치**
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Claude Desktop 설정**
   - 파일: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - 추가:
   ```json
   {
     "mcpServers": {
       "light-archive": {
         "command": "/usr/bin/python3",
         "args": ["/Users/jeong-gyeonghun/Downloads/clean-blog-archive/light-archive-mcp/light_archive_mcp_fixed.py"]
       }
     }
   }
   ```

4. **Claude Desktop 재시작** → 완료! 🎉

---

## 📂 파일 가이드

| 파일 | 용도 | 읽어야 할까? |
|------|------|-------------|
| **light_archive_mcp_fixed.py** | ⭐ **메인 서버 (이것 사용!)** | 코드 보고 싶으면 |
| **QUICKSTART.md** | 🚀 3분 빠른 시작 | ✅ 필독! |
| **SETUP_GUIDE.md** | 📚 완전한 가이드 | 문제 발생 시 |
| **README_FIXED.md** | 📄 프로젝트 개요 | 개요 보고 싶으면 |
| light_archive_mcp.py | ❌ 구 버전 (사용 금지) | 무시 |
| README.md | 구 버전 문서 | 무시 |

---

## ✅ 체크리스트

설치 전:
- [ ] Python 3.9+ 있음 (`python3 --version`)
- [ ] pip3 있음 (`pip3 --version`)
- [ ] 상위 디렉토리에 `.env.local` 있음

설치:
- [ ] `ln -s ../.env.local .env`
- [ ] `pip3 install -r requirements.txt`
- [ ] Claude Desktop 설정
- [ ] Claude Desktop 재시작

테스트:
- [ ] Claude에게 "Light Archive에서 프로젝트 검색해줘" 시도
- [ ] 🔨 도구 아이콘 보임
- [ ] 검색 결과 나옴

---

## 💡 바로 시도해보기

Claude에게 이렇게 말해보세요:

```
"Light Archive에서 Vision 관련 프로젝트 찾아줘"

"GPT-4 챗봇 프로젝트 아카이브 만들어줘.
초안도 AI로 생성하고 태그도 자동 추천해줘."
```

---

## 🆘 문제 해결

### Q: pip/python 명령어가 안 돼요
A: macOS에서는 `pip3`와 `python3`를 사용하세요!

### Q: Claude에서 도구가 안 보여요
A: 
1. 설정 파일 경로 확인
2. 절대 경로 사용 확인
3. Claude Desktop 완전 종료 후 재시작
4. 새 대화 시작

### Q: Supabase 연결 에러
A: `.env` 파일 확인 (`cat .env`)

---

**QUICKSTART.md를 읽고 시작하세요! 🚀**
