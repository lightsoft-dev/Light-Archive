/**
 * Supabase Storage 기반 첨부파일 관리
 * 별도 DB 테이블 없이 Storage의 폴더 구조로 관리
 *
 * 경로 구조: thumbnails/attachments/{archiveId}/{파일명}
 */

import { supabase } from "./supabase"
import type { Attachment } from "@/types/archive"

const BUCKET = "thumbnails"
const ATTACHMENTS_PATH = "attachments"

// 신규 저장 키에 붙는 마커. 이 마커 뒤 문자열은 Base64URL로 인코딩된 원본 파일명이다.
// 구 버전(마커 없는) 파일과 구분하기 위해 사용한다.
const ENCODED_NAME_MARKER = "enc-"

/**
 * 원본 파일명(한글 포함)을 Storage 키에 안전하게 담기 위한 Base64URL 인코딩.
 *
 * Supabase Storage 키는 한글 같은 유니코드를 InvalidKey로 거부하므로,
 * 파일명을 ASCII 문자(A-Z a-z 0-9 - _)로만 이뤄진 Base64URL로 변환해 키에 보존한다.
 * macOS는 한글 파일명을 NFD(자모 분리형)로 넘기기 때문에, 먼저 NFC로 합쳐 정규화한다.
 */
function encodeFileName(name: string): string {
  const utf8Bytes = new TextEncoder().encode(name.normalize("NFC"))
  let binary = ""
  utf8Bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
  // btoa로 base64 변환 후, URL-safe 문자로 치환하고 패딩(=)은 제거
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}

/**
 * Base64URL로 인코딩된 파일명을 원본 문자열로 복원한다.
 * 디코딩에 실패하면(잘못된 값 등) null을 반환해 호출부에서 fallback 하도록 한다.
 */
function decodeFileName(encoded: string): string | null {
  try {
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
    // base64 길이는 4의 배수여야 하므로 제거했던 패딩을 다시 채운다
    while (base64.length % 4) base64 += "="
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

/**
 * Storage에 저장된 물리 파일명에서 표시용 원본 파일명을 복원한다.
 * - 신규 형식: {timestamp}-enc-{base64url}  → Base64URL 디코딩
 * - 구 형식:   {timestamp}-{safeName}       → 타임스탬프 접두사만 제거
 *   (구 형식의 한글은 이미 '_'로 치환돼 원본 복원 불가)
 */
function restoreOriginalName(storedName: string): string {
  const encodedMatch = storedName.match(/^\d+-enc-(.+)$/)
  if (encodedMatch) {
    const decoded = decodeFileName(encodedMatch[1])
    if (decoded) return decoded
  }
  return storedName.replace(/^\d+-/, "")
}

/**
 * 파일 업로드
 * - archiveId 폴더 하위에 파일을 업로드
 * - 동일 파일명 충돌 방지를 위해 타임스탬프 접두사 추가
 */
export async function uploadAttachment(
  archiveId: string,
  file: File
): Promise<Attachment | null> {
  const timestamp = Date.now()
  // 원본 파일명(한글 포함)을 Base64URL로 인코딩해 Storage 키에 보존한다.
  // 키에 확장자가 남지 않으므로 contentType을 명시해 다운로드/미리보기 시 타입이 유지되게 한다.
  const encodedName = encodeFileName(file.name)
  const storagePath = `${ATTACHMENTS_PATH}/${archiveId}/${timestamp}-${ENCODED_NAME_MARKER}${encodedName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "application/octet-stream",
    })

  if (error) {
    console.error("파일 업로드 실패:", error)
    return null
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)

  return {
    // 표시용 이름도 NFC로 정규화해 자모 분리 상태로 보이지 않게 한다
    name: file.name.normalize("NFC"),
    url: urlData.publicUrl,
    size: file.size,
    type: file.type,
  }
}

/**
 * 아카이브의 모든 첨부파일 목록 조회
 * - Storage 폴더를 리스트하여 파일 정보 반환
 */
export async function getAttachments(archiveId: string): Promise<Attachment[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${ATTACHMENTS_PATH}/${archiveId}`)

  if (error) {
    console.error("첨부파일 목록 조회 실패:", error)
    return []
  }

  if (!data || data.length === 0) return []

  return data
    .filter((file) => file.name !== ".emptyFolderPlaceholder")
    .map((file) => {
      const storagePath = `${ATTACHMENTS_PATH}/${archiveId}/${file.name}`
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

      // 저장 키에서 원본 파일명 복원 (신규: Base64URL 디코딩 / 구: 타임스탬프 제거)
      const originalName = restoreOriginalName(file.name)

      return {
        name: originalName,
        url: urlData.publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "",
      }
    })
}

/**
 * 첨부파일 삭제
 * - URL에서 Storage 경로를 추출하여 삭제
 */
export async function deleteAttachment(
  archiveId: string,
  fileUrl: string
): Promise<boolean> {
  // Public URL에서 storage 경로 추출
  const urlParts = fileUrl.split(`/object/public/${BUCKET}/`)
  if (urlParts.length < 2) {
    console.error("잘못된 파일 URL:", fileUrl)
    return false
  }

  const storagePath = decodeURIComponent(urlParts[1])

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) {
    console.error("첨부파일 삭제 실패:", error)
    return false
  }

  return true
}

/**
 * 아카이브의 모든 첨부파일 삭제
 * - 아카이브 삭제 시 호출
 */
export async function deleteAllAttachments(archiveId: string): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(`${ATTACHMENTS_PATH}/${archiveId}`)

  if (error || !data) return false

  const filePaths = data.map(
    (file) => `${ATTACHMENTS_PATH}/${archiveId}/${file.name}`
  )

  if (filePaths.length === 0) return true

  const { error: deleteError } = await supabase.storage
    .from(BUCKET)
    .remove(filePaths)

  if (deleteError) {
    console.error("전체 첨부파일 삭제 실패:", deleteError)
    return false
  }

  return true
}

/**
 * 파일 크기를 읽기 좋은 형식으로 변환
 * 예: 1024 → "1.0 KB", 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`
}

/**
 * 파일 타입에 따른 아이콘 이름 반환
 */
export function getFileIconType(
  fileType: string
): "image" | "pdf" | "document" | "spreadsheet" | "code" | "file" {
  if (fileType.startsWith("image/")) return "image"
  if (fileType === "application/pdf") return "pdf"
  if (
    fileType.includes("word") ||
    fileType.includes("document") ||
    fileType.includes("text/")
  )
    return "document"
  if (fileType.includes("sheet") || fileType.includes("excel"))
    return "spreadsheet"
  if (
    fileType.includes("javascript") ||
    fileType.includes("json") ||
    fileType.includes("html") ||
    fileType.includes("css")
  )
    return "code"
  return "file"
}
