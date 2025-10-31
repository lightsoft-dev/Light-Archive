# Supabase 연결 가이드

이 가이드는 Supabase를 프로젝트에 연결하고 테스트하는 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성하거나 로그인합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트가 생성되면 다음 정보를 확인합니다:
   - Project URL (예: `https://xxxxx.supabase.co`)
   - API Key (anon/public key)

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**주의사항:**
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함되어 있습니다)
- `NEXT_PUBLIC_` 접두사가 붙은 변수는 클라이언트에서 접근 가능합니다
- 프로젝트 URL과 API Key는 Supabase 대시보드의 Settings > API에서 확인할 수 있습니다

## 3. Supabase 패키지 설치

터미널에서 다음 명령어를 실행하여 Supabase 클라이언트 라이브러리를 설치합니다:

```bash
pnpm add @supabase/supabase-js
```

또는 npm을 사용하는 경우:

```bash
npm install @supabase/supabase-js
```

## 4. 테스트 페이지 사용 방법

1. 개발 서버를 실행합니다:
   ```bash
   pnpm dev
   ```

2. 브라우저에서 `http://localhost:3000/test`로 이동합니다.

3. 테스트 페이지에서 다음 기능을 확인할 수 있습니다:
   - **환경 변수 확인**: 환경 변수가 올바르게 설정되었는지 확인
   - **연결 테스트**: Supabase 서버와의 기본 연결 확인
   - **데이터베이스 테스트**: PostgreSQL 데이터베이스 연결 확인
   - **Storage 테스트**: 파일 스토리지 연결 확인

## 5. 데이터베이스 테이블 생성 (선택사항)

데이터베이스 테스트가 완전히 작동하려면 테스트용 테이블을 생성할 수 있습니다:

1. Supabase 대시보드에서 SQL Editor로 이동합니다.
2. 다음 SQL을 실행하여 테스트 테이블을 생성합니다:

```sql
-- 테스트 테이블 생성
CREATE TABLE IF NOT EXISTS test_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 데이터 삽입
INSERT INTO test_table (name) VALUES ('테스트 데이터 1'), ('테스트 데이터 2');
```

## 6. Storage 버킷 생성 및 권한 설정

Storage 테스트가 완전히 작동하려면 테스트용 버킷을 생성하고 권한을 설정해야 합니다:

### 버킷 생성

1. Supabase 대시보드에서 **Storage**로 이동합니다.
2. **"New bucket"** 버튼을 클릭합니다.
3. 버킷 이름을 `test`로 설정합니다.
4. **Public bucket** 옵션을 활성화합니다 (파일을 공개적으로 접근할 수 있도록).

### Storage RLS 정책 설정 (중요!)

버킷을 생성한 후에는 반드시 RLS (Row Level Security) 정책을 설정해야 합니다. 그렇지 않으면 업로드나 조회가 거부될 수 있습니다.

#### 방법 1: Supabase 대시보드에서 설정

1. Storage 페이지에서 생성한 `test` 버킷을 클릭합니다.
2. **"Policies"** 탭으로 이동합니다.
3. **"New Policy"** 버튼을 클릭합니다.
4. 다음 정책들을 생성합니다:

**정책 1: 파일 읽기 (SELECT)**
- Policy name: `Allow public read access`
- Allowed operation: `SELECT`
- Policy definition: `true` (모든 사용자가 읽기 가능)

**정책 2: 파일 업로드 (INSERT)**
- Policy name: `Allow public upload`
- Allowed operation: `INSERT`
- Policy definition: `true` (모든 사용자가 업로드 가능)

**정책 3: 파일 삭제 (DELETE)**
- Policy name: `Allow public delete`
- Allowed operation: `DELETE`
- Policy definition: `true` (모든 사용자가 삭제 가능)

#### 방법 2: SQL Editor에서 설정

1. Supabase 대시보드에서 **SQL Editor**로 이동합니다.
2. 다음 SQL을 실행합니다:

```sql
-- Storage 버킷 정책 생성
-- test 버킷에 대한 공개 읽기 권한
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'test');

-- test 버킷에 대한 공개 업로드 권한
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'test');

-- test 버킷에 대한 공개 삭제 권한
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'test');
```

**주의사항:**
- 위 정책은 모든 사용자에게 공개 접근을 허용합니다. 프로덕션 환경에서는 더 엄격한 정책을 설정하세요.
- 인증된 사용자만 접근하도록 하려면 `auth.role() = 'authenticated'` 조건을 추가하세요.

## 7. Supabase 클라이언트 사용 방법

프로젝트의 다른 파일에서 Supabase 클라이언트를 사용하려면:

```typescript
import { supabase } from '@/lib/supabase'

// 데이터 조회
const { data, error } = await supabase
  .from('your_table')
  .select('*')

// 데이터 삽입
const { data, error } = await supabase
  .from('your_table')
  .insert([{ column1: 'value1', column2: 'value2' }])

// 파일 업로드
const { data, error } = await supabase.storage
  .from('your_bucket')
  .upload('path/to/file.jpg', file)
```

## 8. 문제 해결

### 환경 변수가 인식되지 않는 경우
- 개발 서버를 재시작하세요 (`pnpm dev`)
- `.env.local` 파일의 위치가 프로젝트 루트인지 확인하세요
- 변수명에 오타가 없는지 확인하세요

### 연결 실패 오류
- **"Could not find the table 'public._test' in the schema cache" 오류**
  - 이 오류는 실제로는 연결이 정상적으로 작동하고 있다는 의미입니다
  - 테이블이 존재하지 않아서 발생하는 오류이며, 서버에 연결은 성공한 상태입니다
  - 테스트 페이지의 "연결 테스트" 버튼을 다시 클릭하면 업데이트된 로직으로 정상적으로 표시됩니다

- Supabase 프로젝트 URL과 API Key가 올바른지 확인하세요
- Supabase 프로젝트가 일시정지되지 않았는지 확인하세요
- 네트워크 연결을 확인하세요
- 개발 서버를 재시작했는지 확인하세요 (환경 변수 변경 후)

### 데이터베이스 테이블 오류
- 테이블이 실제로 존재하는지 확인하세요
- RLS (Row Level Security) 정책이 쿼리를 차단하지 않는지 확인하세요
- Supabase 대시보드의 Table Editor에서 테이블을 확인하세요

### Storage 오류

#### 버킷 목록이 비어 있거나 표시되지 않는 경우
- `listBuckets()`는 관리자 권한이 필요할 수 있습니다. 이는 정상입니다.
- 특정 버킷(`test`)에 직접 접근하는 방식으로 테스트하세요.

#### 파일 업로드가 거부되는 경우 (RLS 오류)
- **가장 흔한 원인**: Storage RLS 정책이 설정되지 않았습니다.
- Supabase 대시보드 > Storage > test 버킷 > Policies에서 정책을 확인하세요.
- 읽기, 업로드, 삭제 권한이 모두 설정되어 있는지 확인하세요.
- 위의 "Storage 버킷 생성 및 권한 설정" 섹션을 참고하여 정책을 생성하세요.

#### 기타 Storage 오류
- 버킷이 생성되어 있는지 확인하세요
- 버킷의 공개 설정을 확인하세요
- 파일 크기 제한을 확인하세요 (기본값: 50MB)
- 버킷 이름이 정확한지 확인하세요 (대소문자 구분)

## 9. 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트 문서](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js와 Supabase 통합 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 10. 보안 고려사항

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 클라이언트에 노출되지만, RLS 정책으로 보호됩니다
- 서버 사이드 코드에서는 서비스 역할 키를 사용할 수 있지만, 환경 변수로 관리하고 클라이언트에 노출하지 마세요
- 프로덕션 환경에서는 RLS 정책을 적절히 설정하여 데이터 접근을 제어하세요

