#!/usr/bin/env python3
"""
Light Archive MCP Server (v1.0.7)

실제 Light Archive 프로젝트의 데이터베이스 구조에 맞게 수정된 버전입니다.
테이블: archive_items (단일 테이블, tags와 technologies는 배열 필드)

v1.0.7 변경사항:
- AI 관련 도구 제거 (generate_draft, generate_summary, suggest_tags)
- content 필드를 HTML 형식으로 명확히 지정
- 날짜 자동 생성 개선 (created_at, updated_at, published_at)
- 응답 메시지를 HTML 구조화된 형식으로 변경
"""

import os
import json
import asyncio
import time
import random
import string
import io
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from pathlib import Path

# Third-party imports
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ConfigDict
from mcp.server.fastmcp import FastMCP
from supabase import create_client, Client
from openai import AsyncOpenAI
from PIL import Image as PILImage

# Load environment variables
load_dotenv()

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize MCP server
mcp = FastMCP("light_archive_mcp")

# Initialize Supabase client
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("Warning: Supabase credentials not found")
    supabase: Optional[Client] = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase: {e}")
        supabase = None

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    print("Warning: OpenAI API key not found")
    openai_client: Optional[AsyncOpenAI] = None
else:
    try:
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize OpenAI: {e}")
        openai_client = None

# ============================================================================
# CONSTANTS
# ============================================================================

CHARACTER_LIMIT = 25000
DEFAULT_LIMIT = 20
MAX_RETRIES = 3

# ============================================================================
# ENUMS
# ============================================================================

class ArchiveCategory(str, Enum):
    """아카이브 카테고리"""
    TECH = "기술"
    PROJECT = "프로젝트"
    RESEARCH = "리서치"
    NEWS = "뉴스"


class ArchiveStatus(str, Enum):
    """아카이브 상태"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ResponseFormat(str, Enum):
    """응답 포맷"""
    MARKDOWN = "markdown"
    JSON = "json"


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class SearchArchivesInput(BaseModel):
    """아카이브 검색 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(..., min_length=2, max_length=200,
                      description="검색어 (제목, 설명, 내용에서 검색)")
    category: Optional[ArchiveCategory] = Field(None, description="카테고리 필터")
    limit: int = Field(DEFAULT_LIMIT, ge=1, le=100)
    offset: int = Field(0, ge=0)
    response_format: ResponseFormat = Field(ResponseFormat.MARKDOWN)


class GetArchiveInput(BaseModel):
    """아카이브 조회 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    archive_id: str = Field(..., description="아카이브 ID")
    response_format: ResponseFormat = Field(ResponseFormat.MARKDOWN)


class CreateArchiveInput(BaseModel):
    """
    아카이브 생성 입력

    **중요**: content는 반드시 HTML 형식으로 작성해야 합니다.
    - 구조화된 HTML 태그 사용 (h1, h2, h3, p, ul, ol, code, pre 등)
    - 마크다운이 아닌 HTML로 작성
    - 예: <h2>섹션 제목</h2><p>내용...</p>
    """
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=3, max_length=200, description="제목")
    content: str = Field(
        ...,
        min_length=10,
        description="본문 내용 (반드시 HTML 형식으로 작성 - <h2>, <p>, <ul> 등 사용)"
    )
    category: ArchiveCategory = Field(..., description="카테고리 (기술/프로젝트/리서치/뉴스)")
    description: str = Field(..., min_length=10, max_length=500, description="설명 (필수, 4-5줄 요약)")
    tags: List[str] = Field(..., min_items=1, max_items=10, description="태그 배열")
    technologies: List[str] = Field(..., min_items=1, max_items=20, description="기술 스택 배열")
    sub_category: Optional[str] = Field(None, max_length=100, description="서브 카테고리/분야")
    excerpt: Optional[str] = Field(None, max_length=500, description="요약문 (선택)")
    author: Optional[str] = Field(None, max_length=100, description="작성자")
    difficulty: Optional[str] = Field(None, description="난이도")
    thumbnail_url: Optional[str] = Field(None, description="썸네일 URL")


class UpdateArchiveInput(BaseModel):
    """아카이브 수정 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    archive_id: str = Field(..., description="아카이브 ID")
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    excerpt: Optional[str] = Field(None, max_length=500)
    category: Optional[ArchiveCategory] = Field(None)
    sub_category: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = Field(None, max_items=10)
    technologies: Optional[List[str]] = Field(None, max_items=20)
    difficulty: Optional[str] = Field(None)


class GenerateDraftInput(BaseModel):
    """AI 초안 생성 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    category: ArchiveCategory
    sub_category: str = Field(..., min_length=3, max_length=100, description="서브 카테고리/분야")
    topic: str = Field(..., min_length=5, max_length=200, description="주제")
    technologies: Optional[List[str]] = Field(None, max_items=10)


class GenerateSummaryInput(BaseModel):
    """AI 요약 생성 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    content: str = Field(..., min_length=100, description="요약할 내용")
    target_length: int = Field(100, ge=80, le=120)


class SuggestTagsInput(BaseModel):
    """AI 태그 추천 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=50)
    category: ArchiveCategory
    max_suggestions: int = Field(10, ge=5, le=15)


class FindRelatedInput(BaseModel):
    """유사 아카이브 찾기 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    archive_id: str
    limit: int = Field(4, ge=1, le=10)
    response_format: ResponseFormat = Field(ResponseFormat.MARKDOWN)


class ListArchivesInput(BaseModel):
    """아카이브 목록 조회 입력"""
    model_config = ConfigDict(str_strip_whitespace=True)

    category: Optional[ArchiveCategory] = Field(None)
    status: Optional[ArchiveStatus] = Field(None)
    limit: int = Field(DEFAULT_LIMIT, ge=1, le=100)
    offset: int = Field(0, ge=0)
    response_format: ResponseFormat = Field(ResponseFormat.MARKDOWN)


class UploadImageInput(BaseModel):
    """이미지 업로드 입력 - 파일 경로만 받음"""
    model_config = ConfigDict(str_strip_whitespace=True)

    image_path: str = Field(
        ...,
        description="Path to image file (e.g., /mnt/user-data/uploads/image.png)"
    )
    filename: Optional[str] = Field(None, description="파일명 (선택, 없으면 자동 생성)")


class AnalyzeImageInput(BaseModel):
    """이미지 분석 입력 - 파일 경로만 받음"""
    model_config = ConfigDict(str_strip_whitespace=True)

    image_path: str = Field(
        ...,
        description="Path to image file (e.g., /mnt/user-data/uploads/image.png)"
    )
    prompt: Optional[str] = Field(
        "이 이미지를 상세히 설명해주세요. 주요 요소, 색상, 구성, 그리고 전반적인 분위기를 포함해주세요.",
        description="이미지 분석 프롬프트"
    )


class GenerateDraftWithImagesInput(BaseModel):
    """이미지 기반 초안 생성 입력 - 파일 경로만 받음"""
    model_config = ConfigDict(str_strip_whitespace=True)

    image_paths: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Paths to image files (max 5 images, e.g., ['/mnt/user-data/uploads/img1.png'])"
    )
    title: str = Field(..., min_length=3, max_length=200, description="아카이브 제목")
    category: ArchiveCategory = Field(..., description="카테고리")
    context: Optional[str] = Field(None, description="추가 컨텍스트 (프로젝트 설명, 기술 스택 등)")


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def _check_supabase() -> None:
    if supabase is None:
        raise RuntimeError("Supabase not initialized. Please check environment variables.")


def _check_openai() -> None:
    if openai_client is None:
        raise RuntimeError("OpenAI not initialized. Please check OPENAI_API_KEY.")


def _generate_archive_id() -> str:
    """
    아카이브 ID 생성 (Next.js 앱과 동일한 패턴)
    패턴: {timestamp}-{random_string}
    예: 1761901131544-a2mnqr
    """
    timestamp = str(int(time.time() * 1000))  # 밀리초 단위 타임스탬프

    # 랜덤 문자열 생성 (6자리, 소문자+숫자)
    # JavaScript의 Math.random().toString(36).substring(7)과 동일한 결과
    random_chars = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

    return f"{timestamp}-{random_chars}"


async def _upload_image_to_storage(
    image_path: str,
    filename: Optional[str] = None
) -> str:
    """
    파일 경로에서 이미지를 직접 읽어서 Supabase Storage에 업로드
    Base64 인코딩 없이 바이너리로 직접 처리

    Args:
        image_path: 이미지 파일 경로 (e.g., /mnt/user-data/uploads/image.png)
        filename: 파일명 (없으면 자동 생성)

    Returns:
        Public URL
    """
    _check_supabase()

    try:
        # 파일 존재 확인
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")

        # PIL로 이미지 열기 (검증 + 포맷 확인)
        with PILImage.open(image_path) as img:
            # 이미지 포맷 확인
            img_format = img.format.lower() if img.format else 'png'

            # 바이너리로 변환
            buffer = io.BytesIO()
            img.save(buffer, format=img_format.upper())
            image_data = buffer.getvalue()

        # 파일명 생성 (Next.js 앱과 동일한 패턴)
        if not filename:
            filename = _generate_archive_id()

        filename_with_ext = f"{filename}.{img_format}"
        file_path = f"archive-images/{filename_with_ext}"

        # Supabase Storage에 업로드
        response = supabase.storage.from_("thumbnails").upload(
            file_path,
            image_data,
            {
                "content-type": f"image/{img_format}",
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

    except FileNotFoundError as e:
        raise RuntimeError(str(e))
    except Exception as e:
        raise RuntimeError(f"Image upload failed: {str(e)}")


def _handle_error(e: Exception) -> str:
    if isinstance(e, RuntimeError):
        return f"Error: {str(e)}"
    return f"Error: {type(e).__name__} - {str(e)}"


async def _call_openai_with_retry(prompt: str, max_tokens: int = 1000) -> str:
    _check_openai()

    for attempt in range(MAX_RETRIES):
        try:
            response = await openai_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant for a technical archive platform."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(3 * (attempt + 1))
                continue
            else:
                raise e


# ============================================================================
# TOOLS
# ============================================================================

@mcp.tool(
    name="archive_search_archives",
    annotations={
        "title": "Search Archives",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def archive_search_archives(params: SearchArchivesInput) -> str:
    """
    Light Archive 데이터베이스에서 아카이브를 검색합니다.

    테이블: archive_items
    검색 대상: title, description, content
    """
    try:
        _check_supabase()

        # 검색 쿼리 구성
        query = supabase.table("archive_items").select("*")

        # 카테고리 필터
        if params.category:
            query = query.eq("category", params.category.value)

        # Published 상태만 (기본)
        query = query.eq("status", "published")

        # 텍스트 검색
        search_term = f"%{params.query}%"
        query = query.or_(f"title.ilike.{search_term},description.ilike.{search_term},content.ilike.{search_term}")

        # 페이지네이션 및 정렬
        query = query.range(params.offset, params.offset + params.limit - 1)
        query = query.order("created_at", desc=True)

        response = query.execute()
        archives = response.data

        if not archives:
            return f"검색 결과가 없습니다: '{params.query}'"

        # Markdown 포맷
        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# 검색 결과: '{params.query}'", ""]
            lines.append(f"총 {len(archives)}개 결과")
            lines.append("")

            for i, archive in enumerate(archives, 1):
                lines.append(f"## {i}. {archive['title']}")
                lines.append(f"**ID**: `{archive['id']}`")
                lines.append(f"**카테고리**: {archive['category']}")
                if archive.get('sub_category'):
                    lines.append(f"**분야**: {archive['sub_category']}")
                if archive.get('description'):
                    lines.append(f"**설명**: {archive['description']}")
                if archive.get('tags'):
                    tags_str = ", ".join([f"`{tag}`" for tag in archive['tags']])
                    lines.append(f"**태그**: {tags_str}")
                if archive.get('technologies'):
                    tech_str = ", ".join([f"`{tech}`" for tech in archive['technologies']])
                    lines.append(f"**기술**: {tech_str}")
                lines.append("")

            return "\n".join(lines)
        else:
            return json.dumps({"query": params.query, "archives": archives}, ensure_ascii=False, indent=2)

    except Exception as e:
        return _handle_error(e)


@mcp.tool(
    name="archive_get_archive",
    annotations={
        "title": "Get Archive Details",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def archive_get_archive(params: GetArchiveInput) -> str:
    """특정 아카이브의 상세 정보를 조회합니다."""
    try:
        _check_supabase()

        response = supabase.table("archive_items").select("*").eq("id", params.archive_id).execute()

        if not response.data:
            return f"Error: Archive '{params.archive_id}' not found"

        archive = response.data[0]

        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# {archive['title']}", ""]
            lines.append(f"**카테고리**: {archive['category']}")
            if archive.get('sub_category'):
                lines.append(f"**분야**: {archive['sub_category']}")
            if archive.get('description'):
                lines.append(f"**설명**: {archive['description']}")
            if archive.get('tags'):
                tags_str = ", ".join([f"`{tag}`" for tag in archive['tags']])
                lines.append(f"**태그**: {tags_str}")
            if archive.get('technologies'):
                tech_str = ", ".join([f"`{tech}`" for tech in archive['technologies']])
                lines.append(f"**기술**: {tech_str}")
            lines.append("")
            lines.append("---")
            lines.append("")
            if archive.get('content'):
                lines.append(archive['content'])

            return "\n".join(lines)
        else:
            return json.dumps(archive, ensure_ascii=False, indent=2, default=str)

    except Exception as e:
        return _handle_error(e)


@mcp.tool(
    name="archive_create_archive",
    annotations={
        "title": "Create Archive",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True
    }
)
async def archive_create_archive(params: CreateArchiveInput) -> str:
    """
    새 아카이브를 생성합니다.

    **자동 생성 항목:**
    - ID: timestamp-random 형식으로 자동 생성
    - created_at: 현재 시간 (ISO 8601)
    - updated_at: 현재 시간 (ISO 8601)
    - published_at: 현재 시간 (ISO 8601) - 상태가 published인 경우
    - status: "draft" (기본값)
    """
    try:
        _check_supabase()

        # ID 자동 생성 (Next.js 앱과 동일한 패턴)
        archive_id = _generate_archive_id()

        # 현재 시간 (ISO 8601 형식)
        now = datetime.utcnow().isoformat()

        archive_data = {
            "id": archive_id,
            "title": params.title,
            "content": params.content,
            "category": params.category.value,
            "description": params.description,
            "tags": params.tags,
            "technologies": params.technologies,
            "status": "draft",
            "view_count": 0,
            "comment_count": 0,
            "created_at": now,
            "updated_at": now,
            "published_at": now  # 날짜 자동 설정 (Next.js 앱과 동일)
        }

        # 선택적 필드
        if params.sub_category:
            archive_data["sub_category"] = params.sub_category
        if params.excerpt:
            archive_data["excerpt"] = params.excerpt
        if params.author:
            archive_data["author"] = params.author
        if params.difficulty:
            archive_data["difficulty"] = params.difficulty
        if params.thumbnail_url:
            archive_data["thumbnail_url"] = params.thumbnail_url

        response = supabase.table("archive_items").insert(archive_data).execute()

        if not response.data:
            return "Error: Failed to create archive"

        new_archive = response.data[0]

        # HTML 구조화된 응답 (4-5줄 결론 요약 포함)
        created_date = datetime.fromisoformat(new_archive['created_at'].replace('Z', '+00:00'))
        formatted_date = created_date.strftime('%Y년 %m월 %d일 %H:%M')

        return f"""<h1>✅ 아카이브 생성 완료</h1>

<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
  <p><strong>요약:</strong> "{params.title}" 아카이브가 성공적으로 생성되었습니다.
  {params.category.value} 카테고리의 draft 상태로 저장되었으며,
  {len(params.tags)}개의 태그와 {len(params.technologies)}개의 기술 스택이 등록되었습니다.
  ID는 {archive_id}이며, {formatted_date}에 생성되었습니다.</p>
</div>

<h2>생성된 아카이브 정보</h2>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold; width: 150px;">ID</td>
    <td style="padding: 8px;"><code>{new_archive['id']}</code></td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold;">제목</td>
    <td style="padding: 8px;">{params.title}</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold;">카테고리</td>
    <td style="padding: 8px;">{params.category.value}</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold;">상태</td>
    <td style="padding: 8px;">draft</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold;">생성일시</td>
    <td style="padding: 8px;">{formatted_date}</td>
  </tr>
  <tr style="border-bottom: 1px solid #ddd;">
    <td style="padding: 8px; font-weight: bold;">태그</td>
    <td style="padding: 8px;">{', '.join(params.tags)}</td>
  </tr>
  <tr>
    <td style="padding: 8px; font-weight: bold;">기술 스택</td>
    <td style="padding: 8px;">{', '.join(params.technologies)}</td>
  </tr>
</table>

<p style="color: #666; margin-top: 16px;">
  <strong>다음 단계:</strong>
  <a href="http://localhost:3000/admin/edit/{archive_id}">관리자 페이지</a>에서
  이미지 업로드 및 추가 편집이 가능합니다.
</p>
"""

    except Exception as e:
        return _handle_error(e)


@mcp.tool(
    name="archive_update_archive",
    annotations={
        "title": "Update Archive",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True
    }
)
async def archive_update_archive(params: UpdateArchiveInput) -> str:
    """아카이브를 수정합니다."""
    try:
        _check_supabase()

        update_data = {"updated_at": datetime.utcnow().isoformat()}

        if params.title:
            update_data["title"] = params.title
        if params.content:
            update_data["content"] = params.content
        if params.description:
            update_data["description"] = params.description
        if params.excerpt:
            update_data["excerpt"] = params.excerpt
        if params.category:
            update_data["category"] = params.category.value
        if params.sub_category:
            update_data["sub_category"] = params.sub_category
        if params.tags:
            update_data["tags"] = params.tags
        if params.technologies:
            update_data["technologies"] = params.technologies
        if params.difficulty:
            update_data["difficulty"] = params.difficulty

        if len(update_data) == 1:
            return "변경할 내용이 없습니다."

        supabase.table("archive_items").update(update_data).eq("id", params.archive_id).execute()

        return f"# ✅ 아카이브 수정 완료\n\n**ID**: `{params.archive_id}`"

    except Exception as e:
        return _handle_error(e)


# ============================================================================
# AI 도구 제거 - Claude가 직접 작성하므로 불필요
# archive_generate_draft, archive_generate_summary, archive_suggest_tags
# ============================================================================

# @mcp.tool(
#     name="archive_generate_draft",
#     annotations={
#         "title": "Generate Draft (AI)",
#         "readOnlyHint": True,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_generate_draft(params: GenerateDraftInput) -> str:
#     """AI로 초안을 생성합니다. (제거됨 - Claude가 직접 작성)"""
#     pass


# @mcp.tool(
#     name="archive_generate_summary",
#     annotations={
#         "title": "Generate Summary (AI)",
#         "readOnlyHint": True,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_generate_summary(params: GenerateSummaryInput) -> str:
#     """AI로 요약문을 생성합니다. (제거됨 - Claude가 직접 작성)"""
#     pass


# @mcp.tool(
#     name="archive_suggest_tags",
#     annotations={
#         "title": "Suggest Tags (AI)",
#         "readOnlyHint": True,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_suggest_tags(params: SuggestTagsInput) -> str:
#     """AI로 태그를 추천합니다. (제거됨 - Claude가 직접 작성)"""
#     pass


@mcp.tool(
    name="archive_find_related",
    annotations={
        "title": "Find Related Archives",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def archive_find_related(params: FindRelatedInput) -> str:
    """유사 아카이브를 찾습니다."""
    try:
        _check_supabase()

        # 기준 아카이브 조회
        base_response = supabase.table("archive_items").select("*").eq("id", params.archive_id).execute()
        if not base_response.data:
            return f"Error: Archive '{params.archive_id}' not found"

        base_archive = base_response.data[0]
        base_tags = set(base_archive.get('tags', []))
        base_tech = set(base_archive.get('technologies', []))

        # 모든 published 아카이브 조회
        all_response = supabase.table("archive_items").select("*").eq("status", "published").neq("id", params.archive_id).execute()
        all_archives = all_response.data

        # 유사도 계산
        scored = []
        for archive in all_archives:
            score = 0

            if archive['category'] == base_archive['category']:
                score += 30

            archive_tags = set(archive.get('tags', []))
            archive_tech = set(archive.get('technologies', []))

            tag_matches = len(base_tags & archive_tags)
            score += tag_matches * 10

            tech_matches = len(base_tech & archive_tech)
            score += tech_matches * 5

            if score > 0:
                scored.append({"archive": archive, "score": score})

        scored.sort(key=lambda x: x['score'], reverse=True)
        related = scored[:params.limit]

        if not related:
            return f"'{base_archive['title']}'와 유사한 아카이브를 찾을 수 없습니다."

        if params.response_format == ResponseFormat.MARKDOWN:
            lines = [f"# 🔍 '{base_archive['title']}'와 관련된 아카이브", ""]
            lines.append(f"총 {len(related)}개 발견")
            lines.append("")

            for i, item in enumerate(related, 1):
                archive = item['archive']
                lines.append(f"## {i}. {archive['title']} (유사도: {item['score']}점)")
                lines.append(f"**ID**: `{archive['id']}`")
                lines.append(f"**카테고리**: {archive['category']}")
                if archive.get('tags'):
                    lines.append(f"**태그**: {', '.join([f'`{t}`' for t in archive['tags']])}")
                lines.append("")

            return "\n".join(lines)
        else:
            return json.dumps({"base_archive": base_archive, "related": related}, ensure_ascii=False, indent=2, default=str)

    except Exception as e:
        return _handle_error(e)


@mcp.tool(
    name="archive_list_archives",
    annotations={
        "title": "List Archives",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True
    }
)
async def archive_list_archives(params: ListArchivesInput) -> str:
    """아카이브 목록을 조회합니다."""
    try:
        _check_supabase()

        query = supabase.table("archive_items").select("*")

        if params.category:
            query = query.eq("category", params.category.value)
        if params.status:
            query = query.eq("status", params.status.value)

        query = query.range(params.offset, params.offset + params.limit - 1)
        query = query.order("created_at", desc=True)

        response = query.execute()
        archives = response.data

        if params.response_format == ResponseFormat.MARKDOWN:
            lines = ["# 📚 아카이브 목록", ""]
            lines.append(f"총 {len(archives)}개")
            lines.append("")

            for i, archive in enumerate(archives, 1):
                lines.append(f"## {i}. {archive['title']}")
                lines.append(f"**ID**: `{archive['id']}`")
                lines.append(f"**카테고리**: {archive['category']}")
                if archive.get('tags'):
                    lines.append(f"**태그**: {', '.join([f'`{t}`' for t in archive['tags']])}")
                lines.append("")

            return "\n".join(lines)
        else:
            return json.dumps({"archives": archives}, ensure_ascii=False, indent=2, default=str)

    except Exception as e:
        return _handle_error(e)


# ============================================================================
# 이미지 업로드 도구 - 비활성화 (파일 시스템 접근 제한으로 작동 안 함)
# 대신 Next.js 앱에서 직접 업로드하세요: achive.lightsoft.dev   
# ============================================================================

# @mcp.tool(
#     name="archive_upload_image",
#     annotations={
#         "title": "Upload Image to Supabase Storage (DISABLED)",
#         "readOnlyHint": False,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_upload_image(params: UploadImageInput) -> str:
#     """
#     DISABLED: MCP cannot access file system paths.
#     Please use Next.js app to upload images: achive.lightsoft.dev 
#     """
#     return """# ⚠️ 이미지 업로드 도구 비활성화
#
# MCP 서버가 파일 시스템 경로에 접근할 수 없습니다.
#
# **해결 방법:**
# 1. achive.lightsoft.dev 접속
# 2. 새 아카이브 생성 또는 기존 아카이브 수정
# 3. 이미지 업로드 기능 사용
# 4. 업로드된 URL을 본문에 사용
# """


# @mcp.tool(
#     name="archive_analyze_image",
#     annotations={
#         "title": "Analyze Image with AI (DISABLED)",
#         "readOnlyHint": True,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_analyze_image(params: AnalyzeImageInput) -> str:
#     """
#     DISABLED: MCP cannot access file system paths.
#     """
#     return """# ⚠️ 이미지 분석 도구 비활성화
#
# MCP 서버가 파일 시스템 경로에 접근할 수 없습니다.
# Claude가 이미지를 직접 분석할 수 있으니, 이미지를 첨부해주시면 분석해드립니다.
# """


# @mcp.tool(
#     name="archive_generate_draft_with_images",
#     annotations={
#         "title": "Generate Draft with Images (DISABLED)",
#         "readOnlyHint": False,
#         "destructiveHint": False,
#         "idempotentHint": False,
#         "openWorldHint": True
#     }
# )
# async def archive_generate_draft_with_images(params: GenerateDraftWithImagesInput) -> str:
#     """
#     DISABLED: MCP cannot access file system paths.
#     """
#     return """# ⚠️ 이미지 기반 초안 생성 도구 비활성화
#
# MCP 서버가 파일 시스템 경로에 접근할 수 없습니다.
#
# **해결 방법:**
# 1. 이미지를 Claude에게 직접 첨부
# 2. "이 이미지를 분석해서 아카이브 초안 작성해줘"라고 요청
# 3. 생성된 초안으로 `archive_create_archive` 도구 사용
# 4. achive.lightsoft.dev에서 이미지 업로드
# """


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    mcp.run()
