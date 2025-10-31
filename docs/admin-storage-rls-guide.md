# Admin 페이지 이미지 업로드 권한 설정 가이드

## 문제 상황
Admin 페이지에서 이미지를 붙여넣거나 드래그 앤 드롭할 때 다음 에러가 발생합니다:
```
new row violates row-level security policy
```

## 원인
Supabase Storage의 `thumbnails` 버킷에 **RLS(Row Level Security) 정책**이 설정되지 않았기 때문입니다.

## 해결 방법

### 1️⃣ Supabase 대시보드에서 버킷 확인

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭
4. `thumbnails` 버킷이 있는지 확인

**버킷이 없다면:**
- **"New bucket"** 버튼 클릭
- 버킷 이름: `thumbnails`
- **Public bucket** 체크 (공개 접근 허용)
- 생성

### 2️⃣ RLS 정책 설정 (중요!)

#### 방법 A: Supabase 대시보드에서 설정 (추천)

1. Storage 페이지에서 **`thumbnails`** 버킷 클릭
2. 상단의 **"Policies"** 탭 클릭
3. **"New Policy"** 버튼 클릭
4. 다음 3개의 정책을 생성합니다:

---

**정책 1: 파일 읽기 (SELECT)**
- **Policy name**: `Allow public read access`
- **Allowed operation**: `SELECT`
- **Policy definition (USING expression)**:
  ```sql
  true
  ```
- 설명: 모든 사용자가 파일을 읽을 수 있도록 허용

---

**정책 2: 파일 업로드 (INSERT)**
- **Policy name**: `Allow public upload`
- **Allowed operation**: `INSERT`
- **Policy definition (WITH CHECK expression)**:
  ```sql
  true
  ```
- 설명: 모든 사용자가 파일을 업로드할 수 있도록 허용

---

**정책 3: 파일 삭제 (DELETE)**
- **Policy name**: `Allow public delete`
- **Allowed operation**: `DELETE`
- **Policy definition (USING expression)**:
  ```sql
  true
  ```
- 설명: 모든 사용자가 파일을 삭제할 수 있도록 허용

---

#### 방법 B: SQL Editor에서 설정

1. Supabase 대시보드 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **"New query"** 클릭
3. 다음 SQL을 복사하여 붙여넣기:

```sql
-- thumbnails 버킷에 대한 공개 읽기 권한
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- thumbnails 버킷에 대한 공개 업로드 권한
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails');

-- thumbnails 버킷에 대한 공개 삭제 권한
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'thumbnails');
```

4. **"Run"** 버튼 클릭하여 실행
5. 성공 메시지가 나타나면 완료!

### 3️⃣ 테스트

1. Admin 페이지 새로고침 (`/admin/new`)
2. 에디터에 스크린샷 붙여넣기 (Ctrl+V / Cmd+V)
3. "이미지 업로드 중..." → "이미지가 업로드되었습니다!" 토스트 확인

## 보안 참고사항

### 현재 설정 (개발/테스트용)
```sql
true  -- 모든 사용자가 접근 가능
```

### 프로덕션 환경 권장 설정
로그인한 사용자만 업로드/삭제 가능하도록 변경:

```sql
-- 읽기는 공개
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- 업로드는 인증된 사용자만
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.role() = 'authenticated'
);

-- 삭제는 인증된 사용자만 (자신이 업로드한 파일만)
CREATE POLICY "Allow authenticated delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 파일 구조

Admin 에디터에서 업로드된 이미지는 다음 경로에 저장됩니다:
```
thumbnails/
  └── archive-images/
      ├── 1234567890-abc123.png
      ├── 1234567891-def456.jpg
      └── ...
```

## 문제 해결

### 여전히 에러가 발생하는 경우

1. **브라우저 개발자 도구 콘솔 확인**
   - F12 → Console 탭
   - 에러 메시지 확인

2. **Supabase Storage Policies 재확인**
   - Storage → `thumbnails` → Policies
   - 3개의 정책이 모두 생성되었는지 확인
   - 각 정책의 Definition이 `true`인지 확인

3. **버킷 설정 확인**
   - Storage → `thumbnails` → Configuration
   - **Public bucket** 옵션이 켜져 있는지 확인

4. **SQL Editor로 기존 정책 삭제 후 재생성**
   ```sql
   -- 기존 정책 삭제
   DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
   DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
   DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

   -- 새로 생성 (위의 SQL 코드 사용)
   ```

## 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Supabase RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- 프로젝트 내 가이드: `docs/supabase-guide.md`
