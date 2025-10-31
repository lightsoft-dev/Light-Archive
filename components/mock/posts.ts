/**
 * Posts 테이블 목데이터
 * Supabase posts 테이블 구조를 참고하여 작성
 */
import { Post } from "@/types/archive"

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "ChatGPT 소개입니다.",
    description: "OpenAI가 개발한 대규모 언어 모델 ChatGPT에 대한 소개",
    category: "AI",
    date: "2024년 1월 15일",
    status: "published",
    content: "<p>ChatGPT는 OpenAI가 개발한 대규모 언어 모델입니다.</p>",
    tags: ["AI", "ChatGPT", "OpenAI"],
    technologies: ["GPT", "NLP"],
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    title: "AI의 미래",
    description: "인공지능 기술의 발전 방향과 미래 전망",
    category: "Technology",
    date: "2024년 1월 10일",
    status: "published",
    content: "<p>인공지능 기술은 빠르게 발전하고 있습니다.</p>",
    tags: ["AI", "기술 동향", "미래"],
    technologies: ["AI", "Machine Learning"],
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
  },
  {
    id: "3",
    title: "머신러닝 기초",
    description: "데이터로부터 학습하는 머신러닝의 기본 개념",
    category: "AI",
    date: "2024년 1월 5일",
    status: "draft",
    content: "<p>머신러닝은 데이터로부터 학습하는 기술입니다.</p>",
    tags: ["머신러닝", "AI", "기초"],
    technologies: ["Python", "scikit-learn"],
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
  },
  {
    id: "4",
    title: "딥러닝 알고리즘",
    description: "신경망을 활용한 딥러닝 알고리즘 소개",
    category: "Technology",
    date: "2023년 12월 20일",
    status: "published",
    content: "<p>딥러닝은 신경망을 활용한 학습 방법입니다.</p>",
    tags: ["딥러닝", "신경망", "알고리즘"],
    technologies: ["TensorFlow", "PyTorch"],
    created_at: "2023-12-20T00:00:00Z",
    updated_at: "2023-12-20T00:00:00Z",
  },
  {
    id: "5",
    title: "자연어 처리",
    description: "컴퓨터가 인간의 언어를 이해하는 자연어 처리 기술",
    category: "AI",
    date: "2023년 12월 15일",
    status: "archived",
    content: "<p>자연어 처리는 컴퓨터가 인간의 언어를 이해하는 기술입니다.</p>",
    tags: ["NLP", "자연어처리", "AI"],
    technologies: ["spaCy", "NLTK"],
    created_at: "2023-12-15T00:00:00Z",
    updated_at: "2023-12-15T00:00:00Z",
  },
]

