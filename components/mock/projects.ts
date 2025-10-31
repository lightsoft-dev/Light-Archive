/**
 * Projects 테이블 목데이터
 * Supabase projects 테이블 구조를 참고하여 작성
 */
import { Project } from "@/types/archive"

export const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI 챗봇 플랫폼",
    description: "고객 서비스를 위한 지능형 챗봇 솔루션",
    image: "/ai-chatbot-interface-icon.jpg",
    category: "프로젝트",
    date: "2024년 3월 15일",
    tags: ["AI", "챗봇", "고객서비스"],
    technologies: ["React", "Python", "OpenAI API"],
    difficulty: "중급",
    viewCount: 1240,
    commentCount: 23,
    content: `<p>고객 서비스의 효율성을 높이기 위해 AI 기반 챗봇 플랫폼을 개발했습니다. 이 플랫폼은 자연어 처리 기술을 활용하여 고객의 문의를 실시간으로 이해하고 적절한 답변을 제공합니다.</p>

<h2>프로젝트 배경</h2>
<p>전통적인 고객 서비스 방식은 응답 시간이 길고, 인력 비용이 높으며, 24시간 서비스를 제공하기 어렵다는 한계가 있습니다. 이러한 문제를 해결하기 위해 AI 기술을 활용한 자동화된 고객 서비스 시스템을 구축하게 되었습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/ai-chatbot-interface-icon.jpg" alt="AI 챗봇 인터페이스" class="w-full h-auto" />
</div>

<h2>주요 기능</h2>
<ul>
  <li><strong>자연어 이해:</strong> 고객의 의도를 정확히 파악하여 맥락에 맞는 답변 제공</li>
  <li><strong>다중 채널 지원:</strong> 웹사이트, 모바일 앱, 메신저 등 다양한 채널에서 동일한 경험 제공</li>
  <li><strong>학습 기능:</strong> 대화 기록을 분석하여 지속적으로 개선</li>
  <li><strong>인간 상담사 연결:</strong> 복잡한 문의는 자동으로 전문 상담사에게 연결</li>
</ul>

<h2>기술 스택</h2>
<p>프론트엔드는 React를 사용하여 직관적인 사용자 인터페이스를 구현했고, 백엔드는 Python과 FastAPI로 구축했습니다. OpenAI의 GPT 모델을 활용하여 자연어 처리를 구현했으며, 대화 상태 관리를 위해 Redis를 사용했습니다.</p>

<h2>성과</h2>
<p>이 플랫폼을 도입한 이후 고객 응답 시간이 평균 2분에서 10초로 단축되었고, 고객 만족도가 15% 향상되었습니다. 또한 고객 서비스 담당자의 업무 부담이 줄어들어 더 복잡한 문의에 집중할 수 있게 되었습니다.</p>`,
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
  {
    id: "2",
    title: "데이터 분석 대시보드",
    description: "실시간 데이터 시각화 및 인사이트 도구",
    image: "/data-analytics-dashboard-icon.jpg",
    category: "프로젝트",
    date: "2024년 3월 10일",
    tags: ["데이터 분석", "시각화", "대시보드"],
    technologies: ["React", "TypeScript", "Chart.js"],
    difficulty: "중급",
    viewCount: 892,
    commentCount: 15,
    content: `<p>비즈니스 의사결정을 지원하기 위해 실시간 데이터를 시각화하고 인사이트를 제공하는 대시보드를 개발했습니다. 다양한 데이터 소스를 통합하여 한눈에 파악할 수 있는 인터페이스를 제공합니다.</p>

<h2>프로젝트 목표</h2>
<p>기존에는 여러 시스템에서 데이터를 수집하고 Excel로 정리하는 과정이 번거로웠습니다. 이를 자동화하고 실시간으로 업데이트되는 대시보드를 통해 더 빠른 의사결정을 지원하고자 했습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/data-analytics-dashboard-icon.jpg" alt="데이터 분석 대시보드" class="w-full h-auto" />
</div>

<h2>핵심 기능</h2>
<ul>
  <li><strong>실시간 데이터 수집:</strong> 다양한 API와 데이터베이스에서 자동으로 데이터 수집</li>
  <li><strong>인터랙티브 차트:</strong> 사용자가 원하는 기간과 필터를 선택하여 데이터 탐색</li>
  <li><strong>알림 시스템:</strong> 특정 임계값을 넘으면 자동으로 알림 전송</li>
  <li><strong>다양한 차트 타입:</strong> 선형, 막대형, 파이 차트 등 상황에 맞는 시각화</li>
</ul>

<h2>기술 구현</h2>
<p>React와 TypeScript를 사용하여 타입 안정성을 확보했고, Chart.js 라이브러리를 활용하여 다양한 차트를 구현했습니다. WebSocket을 통해 실시간 데이터 업데이트를 구현했으며, 성능 최적화를 위해 데이터 캐싱 전략을 적용했습니다.</p>

<h2>사용자 피드백</h2>
<p>이 대시보드를 통해 데이터 분석 시간이 평균 70% 단축되었고, 의사결정 속도가 크게 향상되었습니다. 특히 실시간 알림 기능으로 문제 상황을 조기에 발견할 수 있게 되었습니다.</p>`,
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z",
  },
  {
    id: "3",
    title: "이미지 생성 AI",
    description: "텍스트로 고품질 이미지를 생성하는 도구",
    image: "/image-generation-ai-tool-icon.jpg",
    category: "프로젝트",
    date: "2024년 3월 5일",
    tags: ["AI", "이미지 생성", "머신러닝"],
    technologies: ["Python", "TensorFlow", "React"],
    difficulty: "고급",
    viewCount: 2156,
    commentCount: 42,
    content: `<p>텍스트 입력만으로 고품질 이미지를 생성하는 AI 도구를 개발했습니다. Stable Diffusion 모델을 활용하여 사용자의 창의성을 지원하고 다양한 스타일의 이미지를 생성할 수 있습니다.</p>

<h2>기술적 도전</h2>
<p>이미지 생성 AI는 엄청난 컴퓨팅 리소스를 필요로 합니다. 이를 해결하기 위해 모델 최적화와 효율적인 추론 파이프라인을 구축했습니다. 또한 사용자 경험을 위해 생성 시간을 단축하는 다양한 기법을 적용했습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/image-generation-ai-tool-icon.jpg" alt="이미지 생성 AI" class="w-full h-auto" />
</div>

<h2>주요 특징</h2>
<ul>
  <li><strong>다양한 스타일 지원:</strong> 사실적, 판타지, 애니메이션 등 다양한 스타일의 이미지 생성</li>
  <li><strong>고해상도 출력:</strong> 최대 2048x2048 해상도 지원</li>
  <li><strong>배치 처리:</strong> 여러 이미지를 동시에 생성하여 효율성 향상</li>
  <li><strong>이미지 편집:</strong> 생성된 이미지의 일부만 수정하는 기능</li>
</ul>

<h2>모델 아키텍처</h2>
<p>Stable Diffusion 모델을 기반으로 하되, 우리의 특정 요구사항에 맞게 fine-tuning을 수행했습니다. 또한 프롬프트 엔지니어링을 통해 더 정확한 결과를 얻을 수 있도록 개선했습니다.</p>

<h2>성능 최적화</h2>
<p>GPU 가속을 활용하고, 모델 양자화와 배치 처리를 통해 추론 속도를 크게 향상시켰습니다. 평균 생성 시간이 초기 30초에서 5초로 단축되었습니다.</p>`,
    created_at: "2024-03-05T00:00:00Z",
    updated_at: "2024-03-05T00:00:00Z",
  },
  {
    id: "4",
    title: "음성 비서 시스템",
    description: "자연스러운 대화가 가능한 음성 AI",
    image: "/voice-assistant-ai-icon.jpg",
    category: "프로젝트",
    date: "2024년 2월 28일",
    tags: ["AI", "음성인식", "NLP"],
    technologies: ["Python", "Speech Recognition", "FastAPI"],
    difficulty: "고급",
    viewCount: 1834,
    commentCount: 31,
    content: `<p>음성으로 자연스럽게 대화할 수 있는 AI 비서 시스템을 개발했습니다. 음성 인식, 자연어 처리, 음성 합성 기술을 통합하여 사용자와 상호작용합니다.</p>

<h2>시스템 개요</h2>
<p>이 시스템은 음성 입력을 받아 텍스트로 변환하고, 의미를 이해한 후 적절한 응답을 생성하여 음성으로 전달합니다. 전체 과정이 실시간으로 이루어져 자연스러운 대화가 가능합니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/voice-assistant-ai-icon.jpg" alt="음성 비서 시스템" class="w-full h-auto" />
</div>

<h2>기술 구성 요소</h2>
<ul>
  <li><strong>음성 인식 (ASR):</strong> Whisper 모델을 활용한 고정확도 음성-텍스트 변환</li>
  <li><strong>자연어 이해 (NLU):</strong> 의도 파악 및 엔티티 추출</li>
  <li><strong>대화 관리:</strong> 컨텍스트를 유지하며 멀티턴 대화 지원</li>
  <li><strong>음성 합성 (TTS):</strong> 자연스러운 음성 출력 생성</li>
</ul>

<h2>주요 기능</h2>
<p>일정 관리, 날씨 조회, 뉴스 읽기, 스마트홈 제어 등 다양한 기능을 지원합니다. 또한 사용자의 말투와 선호도를 학습하여 개인화된 경험을 제공합니다.</p>

<h2>성능 지표</h2>
<p>음성 인식 정확도는 95% 이상을 달성했으며, 평균 응답 시간은 1.5초 이하입니다. 사용자 만족도 조사 결과 4.5/5.0을 기록했습니다.</p>`,
    created_at: "2024-02-28T00:00:00Z",
    updated_at: "2024-02-28T00:00:00Z",
  },
  {
    id: "ai-content",
    title: "AI 기반 콘텐츠 생성 플랫폼",
    description: "최신 AI 기술을 활용하여 고품질 콘텐츠를 자동으로 생성하는 혁신적인 플랫폼입니다.",
    image: "/modern-ai-content-generation-platform-dashboard-in.jpg",
    category: "프로젝트",
    date: "2024년 3월 15일",
    tags: ["인공지능", "머신러닝", "자연어처리", "웹 개발", "클라우드"],
    technologies: ["Next.js", "TypeScript", "Python", "TensorFlow", "PostgreSQL", "Redis"],
    difficulty: "고급",
    viewCount: 3245,
    commentCount: 67,
    content: `<p>최신 AI 기술을 활용하여 블로그 포스트, 마케팅 콘텐츠, 소셜 미디어 게시물 등을 자동으로 생성하는 플랫폼을 개발했습니다. GPT 모델과 다양한 생성형 AI 기술을 통합하여 사용자가 원하는 스타일과 톤의 콘텐츠를 생성할 수 있습니다.</p>

<h2>프로젝트 비전</h2>
<p>콘텐츠 제작에 소요되는 시간과 비용을 크게 줄이면서도, 고품질의 콘텐츠를 일관되게 생성할 수 있는 플랫폼을 만들고자 했습니다. 이를 통해 마케팅 팀과 콘텐츠 크리에이터의 생산성을 극대화할 수 있습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/modern-ai-content-generation-platform-dashboard-in.jpg" alt="AI 콘텐츠 생성 플랫폼 대시보드" class="w-full h-auto" />
</div>

<h2>핵심 기능</h2>
<ul>
  <li><strong>다양한 콘텐츠 유형:</strong> 블로그 포스트, 이메일, 소셜 미디어 게시물, 제품 설명 등</li>
  <li><strong>브랜드 톤앤매너 학습:</strong> 기존 콘텐츠를 분석하여 브랜드 스타일을 학습</li>
  <li><strong>다국어 지원:</strong> 20개 이상의 언어로 콘텐츠 생성</li>
  <li><strong>협업 기능:</strong> 팀원들과 실시간으로 콘텐츠를 수정하고 개선</li>
  <li><strong>SEO 최적화:</strong> 검색 엔진 최적화를 위한 키워드 제안 및 분석</li>
</ul>

<h2>기술 아키텍처</h2>
<p>프론트엔드는 Next.js와 TypeScript로 구축하여 서버 사이드 렌더링과 타입 안정성을 확보했습니다. 백엔드는 Python과 FastAPI로 구축했으며, 다양한 AI 모델을 API로 통합했습니다. PostgreSQL로 콘텐츠와 사용자 데이터를 관리하고, Redis를 활용하여 캐싱과 세션 관리를 구현했습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/ai-content-generation-workflow-diagram-with-neural.jpg" alt="AI 워크플로우" class="w-full h-auto" />
</div>

<h2>AI 모델 통합</h2>
<p>OpenAI GPT-4, Claude, 그리고 자체 fine-tuning된 모델을 활용하여 다양한 용도에 최적화된 콘텐츠를 생성합니다. 각 모델의 장점을 활용하여 가장 적합한 모델을 자동으로 선택합니다.</p>

<h2>사용자 경험</h2>
<p>직관적인 인터페이스로 사용자가 쉽게 콘텐츠를 생성하고 편집할 수 있습니다. 실시간 미리보기 기능으로 생성된 콘텐츠를 즉시 확인할 수 있으며, 여러 버전을 생성하여 비교할 수 있습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/team-collaboration-on-ai-platform-with-multiple-us.jpg" alt="팀 협업" class="w-full h-auto" />
</div>

<h2>성과</h2>
<p>이 플랫폼을 도입한 이후 콘텐츠 제작 시간이 평균 80% 단축되었고, 콘텐츠 품질에 대한 피드백도 긍정적입니다. 특히 반복적인 콘텐츠 작업에서 효율성이 크게 향상되었습니다.</p>`,
    created_at: "2024-03-15T00:00:00Z",
    updated_at: "2024-03-15T00:00:00Z",
  },
  {
    id: "6",
    title: "사내 CRM 시스템 구축",
    description: "고객 관계 관리를 위한 통합 솔루션",
    image: "/crm-dashboard-interface.jpg",
    category: "프로젝트",
    subCategory: "사내시스템",
    date: "2024년 2월 20일",
    tags: ["CRM", "사내시스템", "업무자동화"],
    technologies: ["Next.js", "PostgreSQL", "Prisma", "Redis"],
    difficulty: "중급",
    viewCount: 678,
    commentCount: 12,
    content: `<p>영업팀과 고객지원팀의 업무 효율을 높이기 위해 통합 CRM 시스템을 구축했습니다. 고객 정보 관리, 영업 파이프라인, 티켓 관리 등의 기능을 한 곳에서 제공합니다.</p>

<h2>프로젝트 배경</h2>
<p>기존에는 고객 정보가 Excel과 여러 시스템에 분산되어 있어 정보 조회가 어렵고, 영업 현황 파악이 힘들었습니다. 또한 고객 지원 티켓이 이메일로만 관리되어 우선순위 설정과 상태 추적이 어려웠습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/crm-dashboard-interface.jpg" alt="CRM 대시보드" class="w-full h-auto" />
</div>

<h2>핵심 기능</h2>
<ul>
  <li><strong>고객 관리:</strong> 고객 정보, 히스토리, 구매 내역 통합 관리</li>
  <li><strong>영업 파이프라인:</strong> 딜 진행 상황 시각화 및 자동 알림</li>
  <li><strong>티켓 시스템:</strong> 고객 문의 접수, 할당, 추적</li>
  <li><strong>분석 대시보드:</strong> 매출, 고객 만족도, 응답 시간 등 KPI 시각화</li>
</ul>

<h2>기술 스택</h2>
<p>Next.js를 활용한 SSR로 빠른 초기 로딩을 구현했고, PostgreSQL과 Prisma ORM으로 복잡한 관계형 데이터를 관리합니다. Redis를 활용한 세션 관리와 캐싱으로 성능을 최적화했습니다.</p>

<h2>성과</h2>
<p>시스템 도입 후 고객 정보 조회 시간이 평균 10분에서 5초로 단축되었고, 티켓 처리 시간도 30% 감소했습니다. 영업팀의 딜 성사율도 20% 향상되었습니다.</p>`,
    created_at: "2024-02-20T00:00:00Z",
    updated_at: "2024-02-20T00:00:00Z",
  },
  {
    id: "7",
    title: "전자상거래 플랫폼 구축",
    description: "확장 가능한 온라인 쇼핑몰 플랫폼",
    image: "/ecommerce-platform-screenshot.jpg",
    category: "프로젝트",
    subCategory: "web",
    date: "2024년 2월 15일",
    tags: ["E-commerce", "Web", "결제시스템"],
    technologies: ["Next.js", "Stripe", "Vercel", "Supabase"],
    difficulty: "고급",
    viewCount: 2543,
    commentCount: 48,
    content: `<p>현대적인 사용자 경험과 안정적인 결제 시스템을 갖춘 전자상거래 플랫폼을 구축했습니다. 반응형 디자인과 빠른 페이지 로딩으로 높은 전환율을 달성했습니다.</p>

<h2>프로젝트 목표</h2>
<p>모바일 친화적이면서도 강력한 관리자 기능을 갖춘 전자상거래 플랫폼을 만들고자 했습니다. 특히 결제 안정성과 재고 관리의 정확성을 중요하게 다뤘습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/ecommerce-platform-screenshot.jpg" alt="전자상거래 플랫폼" class="w-full h-auto" />
</div>

<h2>주요 기능</h2>
<ul>
  <li><strong>상품 관리:</strong> 카테고리, 옵션, 재고 관리</li>
  <li><strong>장바구니 & 결제:</strong> Stripe 통합으로 안전한 결제 처리</li>
  <li><strong>주문 관리:</strong> 주문 추적, 배송 상태 업데이트</li>
  <li><strong>고객 계정:</strong> 주문 이력, 위시리스트, 리뷰 작성</li>
  <li><strong>검색 & 필터링:</strong> 빠른 상품 검색과 다양한 필터 옵션</li>
</ul>

<h2>기술적 구현</h2>
<p>Next.js의 ISR(Incremental Static Regeneration)을 활용하여 상품 페이지의 빠른 로딩과 SEO 최적화를 동시에 달성했습니다. Stripe를 통한 안전한 결제 처리와 Webhook을 활용한 주문 상태 동기화를 구현했습니다.</p>

<h2>성과 및 지표</h2>
<p>플랫폼 런칭 후 3개월간 5,000건 이상의 거래를 처리했고, 평균 전환율 3.2%를 달성했습니다. 페이지 로딩 속도 최적화로 사용자 이탈률이 40% 감소했습니다.</p>`,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "8",
    title: "실시간 협업 도구",
    description: "팀 협업을 위한 실시간 문서 편집 플랫폼",
    image: "/collaborative-editor-interface.jpg",
    category: "프로젝트",
    subCategory: "web",
    date: "2024년 2월 5일",
    tags: ["실시간 협업", "WebSocket", "문서 편집"],
    technologies: ["Next.js", "WebSocket", "Yjs", "MongoDB"],
    difficulty: "고급",
    viewCount: 1789,
    commentCount: 36,
    content: `<p>여러 사용자가 동시에 문서를 편집할 수 있는 실시간 협업 플랫폼을 개발했습니다. CRDT(Conflict-free Replicated Data Type) 알고리즘을 활용하여 충돌 없는 동시 편집을 구현했습니다.</p>

<h2>기술적 도전 과제</h2>
<p>실시간 협업 시스템의 가장 큰 과제는 동시 편집 시 발생하는 충돌을 해결하는 것입니다. Yjs 라이브러리의 CRDT 알고리즘을 활용하여 이 문제를 해결했습니다.</p>

<div class="my-12 rounded-2xl overflow-hidden">
  <img src="/collaborative-editor-interface.jpg" alt="협업 편집기" class="w-full h-auto" />
</div>

<h2>핵심 기능</h2>
<ul>
  <li><strong>실시간 동시 편집:</strong> 여러 사용자의 동시 편집 지원</li>
  <li><strong>커서 공유:</strong> 다른 사용자의 커서 위치 실시간 표시</li>
  <li><strong>버전 관리:</strong> 문서 변경 이력 추적 및 복원</li>
  <li><strong>댓글 시스템:</strong> 특정 부분에 대한 논의</li>
  <li><strong>권한 관리:</strong> 읽기/쓰기 권한 세밀하게 제어</li>
</ul>

<h2>기술 스택</h2>
<p>WebSocket을 통한 실시간 통신과 Yjs를 활용한 CRDT 구현으로 안정적인 동시 편집을 지원합니다. MongoDB로 문서와 변경 이력을 저장하고, Redis로 온라인 사용자 상태를 관리합니다.</p>

<h2>사용자 피드백</h2>
<p>원격 근무 환경에서 팀 협업 효율이 크게 향상되었다는 피드백을 받았습니다. 특히 실시간 커서 공유 기능으로 소통이 더 원활해졌다는 평가를 받았습니다.</p>`,
    created_at: "2024-02-05T00:00:00Z",
    updated_at: "2024-02-05T00:00:00Z",
  },
]

