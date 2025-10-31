import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

/**
 * OpenAI API를 테스트하는 API
 * POST /api/openai/test
 *
 * Request Body:
 * {
 *   prompt: string  // 사용자 프롬프트
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // API Key 확인
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.",
        },
        { status: 500 }
      )
    }

    // Request Body 파싱
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        {
          error: "프롬프트를 입력하세요",
        },
        { status: 400 }
      )
    }

    // OpenAI 클라이언트 생성
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    console.log("OpenAI API 호출 시작:", {
      prompt: prompt.substring(0, 100) + "...",
    })

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 빠르고 저렴한 모델
      messages: [
        {
          role: "system",
          content:
            "당신은 기술 문서 작성을 도와주는 전문가입니다. 명확하고 간결하게 답변해주세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500, // 응답 길이 제한
      temperature: 0.7, // 창의성 수준 (0~2, 높을수록 더 창의적)
    })

    const response = completion.choices[0]?.message?.content || "응답 없음"

    console.log("OpenAI API 호출 성공:", {
      model: completion.model,
      usage: completion.usage,
      responseLength: response.length,
    })

    return NextResponse.json({
      success: true,
      response,
      usage: completion.usage, // 토큰 사용량
      model: completion.model,
    })
  } catch (error: any) {
    console.error("OpenAI API 에러:", error)

    // OpenAI API 에러 처리
    if (error.status === 401) {
      return NextResponse.json(
        {
          error: "OpenAI API Key가 유효하지 않습니다. .env.local 파일의 OPENAI_API_KEY를 확인하세요.",
        },
        { status: 401 }
      )
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error: "OpenAI API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.",
        },
        { status: 429 }
      )
    }

    if (error.status === 500) {
      return NextResponse.json(
        {
          error: "OpenAI 서버 에러가 발생했습니다. 잠시 후 다시 시도하세요.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: error.message || "OpenAI API 호출 중 에러가 발생했습니다",
      },
      { status: 500 }
    )
  }
}
