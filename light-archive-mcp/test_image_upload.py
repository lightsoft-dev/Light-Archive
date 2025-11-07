#!/usr/bin/env python3
"""
Light Archive MCP - 이미지 업로드 기능 테스트

이 스크립트는 v1.0.3의 이미지 업로드 기능이 제대로 작동하는지 테스트합니다.
"""

import os
import sys
import base64
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

# 환경 변수 로드
load_dotenv()

# Supabase 클라이언트 초기화
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("❌ 환경 변수가 설정되지 않았습니다!")
    print("NEXT_PUBLIC_SUPABASE_URL:", supabase_url)
    print("NEXT_PUBLIC_SUPABASE_ANON_KEY:", "설정됨" if supabase_key else "없음")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)
print("✅ Supabase 클라이언트 초기화 완료")

# 테스트용 1x1 픽셀 PNG 이미지 (Base64)
# 빨간색 점 1개
TEST_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

async def test_upload_old_way():
    """v1.0.2 방식 (잘못된 방식) - 실패해야 정상"""
    print("\n🔍 테스트 1: v1.0.2 방식 (file_options 사용) - 실패 예상")

    try:
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        file_path = "archive-images/test-old-1762500000000-abc123.png"

        # ❌ 잘못된 방식
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            file_options={  # 이 파라미터가 문제
                "content-type": "image/png",
                "cache-control": "3600",
                "upsert": False
            }
        )

        print("⚠️ 예상치 못한 성공: 이 방식도 작동할 수 있습니다")

        # 업로드된 파일 삭제
        supabase.storage.from_("thumbnails").remove([file_path])

    except TypeError as e:
        print(f"✅ 예상대로 실패함: {e}")
    except Exception as e:
        print(f"❓ 다른 에러 발생: {type(e).__name__}: {e}")


async def test_upload_new_way():
    """v1.0.3 방식 (올바른 방식) - 성공해야 정상"""
    print("\n🔍 테스트 2: v1.0.3 방식 (딕셔너리 직접 전달) - 성공 예상")

    try:
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        file_path = "archive-images/test-new-1762500000000-xyz789.png"

        # ✅ 올바른 방식
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            {  # 딕셔너리 직접 전달
                "content-type": "image/png",
                "cacheControl": "3600",
                "upsert": "false"
            }
        )

        print(f"✅ 업로드 성공!")
        print(f"   Response: {response}")

        # Public URL 확인
        public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)
        print(f"   Public URL: {public_url}")

        # 업로드된 파일 삭제 (테스트 정리)
        print(f"\n🧹 테스트 파일 삭제 중...")
        delete_response = supabase.storage.from_("thumbnails").remove([file_path])
        print(f"   삭제 완료: {delete_response}")

        return True

    except Exception as e:
        print(f"❌ 실패: {type(e).__name__}: {e}")
        return False


async def test_upload_with_error_handling():
    """에러 처리 포함 버전 테스트"""
    print("\n🔍 테스트 3: 에러 처리 포함 버전 - v1.0.3 전체 로직")

    try:
        # Base64 디코딩
        image_data = base64.b64decode(TEST_IMAGE_BASE64)
        file_path = "archive-images/test-full-1762500000000-def456.png"

        # 업로드
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            {
                "content-type": "image/png",
                "cacheControl": "3600",
                "upsert": "false"
            }
        )

        # 에러 체크 (v1.0.3 추가)
        if hasattr(response, 'error') and response.error:
            raise RuntimeError(f"Image upload failed: {response.error}")

        # Public URL
        public_url = supabase.storage.from_("thumbnails").get_public_url(file_path)

        print(f"✅ 전체 로직 성공!")
        print(f"   Public URL: {public_url}")

        # 정리
        supabase.storage.from_("thumbnails").remove([file_path])
        print(f"   테스트 파일 삭제 완료")

        return True

    except base64.binascii.Error as e:
        print(f"❌ Base64 디코딩 실패: {e}")
        return False
    except Exception as e:
        print(f"❌ 업로드 실패: {type(e).__name__}: {e}")
        return False


async def test_invalid_base64():
    """잘못된 Base64 테스트 - 에러 처리 확인"""
    print("\n🔍 테스트 4: 잘못된 Base64 - 에러 처리 확인")

    try:
        # 잘못된 Base64
        image_data = base64.b64decode("invalid-base64-string!!!")
        print("❌ 예상치 못한 성공: Base64 디코딩이 성공했습니다")

    except base64.binascii.Error as e:
        print(f"✅ 예상대로 에러 발생: {e}")
        return True
    except Exception as e:
        print(f"❓ 다른 에러 발생: {type(e).__name__}: {e}")
        return False


async def test_storage_permissions():
    """Storage 권한 테스트"""
    print("\n🔍 테스트 5: Storage 권한 확인")

    try:
        # 버킷 리스트 확인
        buckets = supabase.storage.list_buckets()
        print(f"✅ 사용 가능한 버킷: {[b.name for b in buckets]}")

        # thumbnails 버킷 존재 확인
        thumbnail_bucket = next((b for b in buckets if b.name == "thumbnails"), None)
        if thumbnail_bucket:
            print(f"✅ thumbnails 버킷 발견: {thumbnail_bucket.name}")
            print(f"   Public: {thumbnail_bucket.public}")
        else:
            print("❌ thumbnails 버킷을 찾을 수 없습니다")
            return False

        # 파일 리스트 확인 (archive-images 폴더)
        try:
            files = supabase.storage.from_("thumbnails").list("archive-images")
            print(f"✅ archive-images 폴더 파일 개수: {len(files)}")
            if files and len(files) > 0:
                print(f"   최근 파일: {files[0].get('name', 'N/A')}")
        except Exception as e:
            print(f"⚠️ 파일 리스트 조회 실패 (권한 문제 가능): {e}")

        return True

    except Exception as e:
        print(f"❌ Storage 권한 확인 실패: {type(e).__name__}: {e}")
        return False


async def main():
    print("=" * 60)
    print("🧪 Light Archive MCP - 이미지 업로드 기능 테스트")
    print("=" * 60)

    results = []

    # 테스트 1: 잘못된 방식 (v1.0.2)
    await test_upload_old_way()

    # 테스트 2: 올바른 방식 (v1.0.3)
    result2 = await test_upload_new_way()
    results.append(("v1.0.3 방식", result2))

    # 테스트 3: 전체 로직
    result3 = await test_upload_with_error_handling()
    results.append(("에러 처리 포함", result3))

    # 테스트 4: 잘못된 Base64
    result4 = await test_invalid_base64()
    results.append(("Base64 에러 처리", result4))

    # 테스트 5: Storage 권한
    result5 = await test_storage_permissions()
    results.append(("Storage 권한", result5))

    # 결과 요약
    print("\n" + "=" * 60)
    print("📊 테스트 결과 요약")
    print("=" * 60)

    for test_name, result in results:
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{status}: {test_name}")

    # 전체 성공 여부
    all_passed = all(result for _, result in results)

    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 모든 테스트 통과!")
        print("✅ v1.0.3 이미지 업로드 기능이 정상적으로 작동합니다!")
    else:
        print("⚠️ 일부 테스트 실패")
        print("❌ 위의 에러 메시지를 확인하세요")
    print("=" * 60)

    return all_passed


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
