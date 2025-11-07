#!/usr/bin/env python3
"""
Light Archive MCP - 파일 경로 방식 이미지 업로드 테스트

Claude Desktop이 제공하는 파일 경로로 이미지 업로드가 작동하는지 테스트
"""

import os
import sys
import asyncio
import tempfile
import base64
from dotenv import load_dotenv
from supabase import create_client, Client

# 환경 변수 로드
load_dotenv()

# Supabase 클라이언트 초기화
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("❌ 환경 변수가 설정되지 않았습니다!")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)
print("✅ Supabase 클라이언트 초기화 완료")

# 테스트용 1x1 픽셀 PNG 이미지 (Base64)
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="


# light_archive_mcp_fixed.py의 함수를 그대로 복사
async def _upload_image_to_storage(
    image_base64: str = None,
    image_path: str = None,
    filename: str = None,
    file_extension: str = "png"
) -> str:
    """파일 경로 또는 Base64로 이미지 업로드"""

    if not image_base64 and not image_path:
        raise ValueError("image_base64 또는 image_path 중 하나는 필수입니다")

    try:
        # 파일 경로가 제공된 경우
        if image_path:
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")

            # 파일 직접 읽기
            with open(image_path, 'rb') as f:
                image_data = f.read()

            # 확장자 자동 추출
            if not filename:
                file_extension = os.path.splitext(image_path)[1].lstrip('.').lower() or file_extension

        # Base64가 제공된 경우
        else:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            image_data = base64.b64decode(image_base64)

        # 파일명 생성
        import time
        import random
        import string
        if not filename:
            timestamp = str(int(time.time() * 1000))
            random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            filename = f"{timestamp}-{random_chars}"

        filename_with_ext = f"{filename}.{file_extension}"
        file_path = f"archive-images/{filename_with_ext}"

        # Supabase Storage에 업로드 (v1.0.3 방식)
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            {
                "content-type": f"image/{file_extension}",
                "cacheControl": "3600",
                "upsert": "false"
            }
        )

        # 업로드 실패 체크
        if hasattr(response, 'error') and response.error:
            raise RuntimeError(f"Image upload failed: {response.error}")

        # Public URL 가져오기
        public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)

        return public_url

    except base64.binascii.Error as e:
        raise RuntimeError(f"Base64 decoding failed: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Image upload failed: {str(e)}")


async def test_upload_with_file_path():
    """파일 경로로 업로드 테스트"""
    print("\n🔍 테스트 1: 파일 경로 방식 업로드")

    try:
        # 임시 이미지 파일 생성
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.png', delete=False) as tmp_file:
            tmp_path = tmp_file.name
            # Base64 디코딩해서 실제 PNG 파일 생성
            image_data = base64.b64decode(TEST_IMAGE_BASE64)
            tmp_file.write(image_data)

        print(f"   임시 파일 생성: {tmp_path}")
        print(f"   파일 존재 확인: {os.path.exists(tmp_path)}")
        print(f"   파일 크기: {os.path.getsize(tmp_path)} bytes")

        # 파일 경로로 업로드
        public_url = await _upload_image_to_storage(image_path=tmp_path)

        print(f"✅ 업로드 성공!")
        print(f"   Public URL: {public_url}")

        # 정리
        file_name = os.path.basename(public_url.split('/')[-1])
        file_path = f"archive-images/{file_name}"
        supabase.storage.from_("thumbnails").remove([file_path])
        os.unlink(tmp_path)
        print(f"   테스트 파일 삭제 완료")

        return True

    except Exception as e:
        print(f"❌ 실패: {type(e).__name__}: {e}")
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        return False


async def test_upload_with_simulated_claude_path():
    """Claude Desktop 스타일 경로 시뮬레이션"""
    print("\n🔍 테스트 2: Claude Desktop 스타일 경로 시뮬레이션")

    try:
        # /tmp 폴더에 시뮬레이션 파일 생성 (Claude Desktop 방식 모방)
        simulated_path = f"/tmp/1762491561977_test_image.png"

        # 실제 파일 생성
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        with open(simulated_path, 'wb') as f:
            f.write(image_data)

        print(f"   시뮬레이션 경로: {simulated_path}")
        print(f"   파일 존재: {os.path.exists(simulated_path)}")

        # 업로드
        public_url = await _upload_image_to_storage(image_path=simulated_path)

        print(f"✅ 업로드 성공!")
        print(f"   Public URL: {public_url}")

        # 정리
        file_name = os.path.basename(public_url.split('/')[-1])
        file_path = f"archive-images/{file_name}"
        supabase.storage.from_("thumbnails").remove([file_path])
        os.unlink(simulated_path)
        print(f"   테스트 파일 삭제 완료")

        return True

    except Exception as e:
        print(f"❌ 실패: {type(e).__name__}: {e}")
        if os.path.exists(simulated_path):
            os.unlink(simulated_path)
        return False


async def test_both_methods():
    """Base64와 파일 경로 둘 다 테스트"""
    print("\n🔍 테스트 3: Base64와 파일 경로 비교")

    try:
        # 1. Base64 방식
        print("\n   [Base64 방식]")
        url1 = await _upload_image_to_storage(image_base64=TEST_IMAGE_BASE64)
        print(f"   ✅ Base64 업로드: {url1}")

        # 2. 파일 경로 방식
        print("\n   [파일 경로 방식]")
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.png', delete=False) as tmp_file:
            tmp_path = tmp_file.name
            image_data = base64.b64decode(TEST_IMAGE_BASE64)
            tmp_file.write(image_data)

        url2 = await _upload_image_to_storage(image_path=tmp_path)
        print(f"   ✅ 파일 경로 업로드: {url2}")

        # 정리
        for url in [url1, url2]:
            file_name = os.path.basename(url.split('/')[-1])
            file_path = f"archive-images/{file_name}"
            supabase.storage.from_("thumbnails").remove([file_path])

        os.unlink(tmp_path)

        print(f"\n   ✅ 두 방식 모두 정상 작동!")
        return True

    except Exception as e:
        print(f"   ❌ 실패: {type(e).__name__}: {e}")
        return False


async def main():
    print("=" * 60)
    print("🧪 Light Archive MCP - 파일 경로 방식 테스트")
    print("=" * 60)

    results = []

    # 테스트 1: 파일 경로 방식
    result1 = await test_upload_with_file_path()
    results.append(("파일 경로 방식", result1))

    # 테스트 2: Claude Desktop 스타일
    result2 = await test_upload_with_simulated_claude_path()
    results.append(("Claude Desktop 스타일", result2))

    # 테스트 3: 두 방식 비교
    result3 = await test_both_methods()
    results.append(("두 방식 비교", result3))

    # 결과 요약
    print("\n" + "=" * 60)
    print("📊 테스트 결과 요약")
    print("=" * 60)

    for test_name, result in results:
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{status}: {test_name}")

    all_passed = all(result for _, result in results)

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 모든 테스트 통과!")
        print("✅ 파일 경로 방식이 정상적으로 작동합니다!")
        print("✅ Claude Desktop에서 이미지 경로를 직접 전달할 수 있습니다!")
    else:
        print("⚠️ 일부 테스트 실패")
    print("=" * 60)

    return all_passed


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
