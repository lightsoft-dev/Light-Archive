import { NextResponse } from "next/server"

/**
 * OpenAI API Key가 설정되어 있는지 확인하는 API
 * GET /api/openai/check
 */
export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    // API Key가 설정되어 있는지만 확인
    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          message: "OPENAI_API_KEY가 설정되지 않았습니다",
        },
        { status: 200 }
      )
    }

    // API Key 형식 간단 검증 (sk-로 시작하는지)
    if (!apiKey.startsWith("sk-")) {
      return NextResponse.json(
        {
          configured: false,
          message: "OPENAI_API_KEY 형식이 올바르지 않습니다",
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      configured: true,
      message: "API Key가 설정되어 있습니다",
    })
  } catch (error) {
    console.error("API Key 확인 중 에러:", error)
    return NextResponse.json(
      {
        configured: false,
        message: "API Key 확인 중 에러가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
