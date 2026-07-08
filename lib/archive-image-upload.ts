import { supabase } from "@/lib/supabase"

/**
 * 아카이브 본문용 이미지(또는 GIF) 파일을 Supabase Storage에 업로드하고
 * 공개(public) URL을 반환한다.
 *
 * - 단일 이미지 삽입(advanced-editor)과 이미지 슬라이더 다중 삽입(NodeView)
 *   두 곳에서 공용으로 쓰기 위해 별도 함수로 분리했다.
 * - 업로드에 실패하면(스토리지 미설정/네트워크 오류 등) base64 data URL로
 *   폴백해서 최소한 화면에는 이미지가 표시되도록 한다(임시).
 *
 * @param file 업로드할 이미지 파일
 * @returns 저장된 이미지의 URL (성공: public URL, 실패: base64 data URL)
 */
export async function uploadArchiveImage(file: File): Promise<string> {
  try {
    // 파일명 충돌 방지: 타임스탬프 + 랜덤 문자열
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `archive-images/${fileName}`

    const { error } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("thumbnails").getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    // 업로드 실패 시 base64로 폴백 (임시 표시)
    console.error("이미지 업로드 실패, base64로 폴백합니다:", error)
    return await fileToBase64(file)
  }
}

/**
 * File을 base64 data URL 문자열로 변환한다.
 * (Storage 업로드 실패 시 폴백 용도)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) resolve(e.target.result as string)
      else reject(new Error("파일을 읽지 못했습니다."))
    }
    reader.onerror = () => reject(new Error("파일 읽기 중 오류가 발생했습니다."))
    reader.readAsDataURL(file)
  })
}
