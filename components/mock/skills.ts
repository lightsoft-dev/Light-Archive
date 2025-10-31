/**
 * Skills 테이블 목데이터
 * Supabase skills 테이블 구조를 참고하여 작성
 */
import { Skill } from "@/types/archive"

export const mockSkills: Skill[] = [
  {
    id: "1",
    title: "Next.js 15의 새로운 기능들",
    description: "Next.js 15에서 추가된 주요 기능들과 성능 개선 사항을 살펴봅니다.",
    category: "기술",
    subCategory: "클로드 코드",
    date: "2024년 10월 30일",
    tags: ["Next.js", "React", "웹 개발"],
    technologies: ["Next.js", "React", "TypeScript"],
    difficulty: "중급",
    viewCount: 1542,
    commentCount: 28,
    content: `<p>Next.js 15가 출시되면서 많은 새로운 기능들과 성능 개선이 이루어졌습니다. 이번 업데이트는 개발자 경험과 애플리케이션 성능을 크게 향상시킵니다.</p>

<h2>주요 변경사항</h2>
<p>Next.js 15는 React 19와 완전히 통합되어 새로운 기능들을 활용할 수 있습니다. 특히 Server Components의 성능이 크게 개선되었고, 빌드 시간도 단축되었습니다.</p>

<h2>새로운 기능들</h2>
<ul>
  <li><strong>향상된 Server Components:</strong> 더 빠른 렌더링과 최적화된 번들 크기</li>
  <li><strong>개선된 Turbopack:</strong> 개발 서버 시작 시간이 50% 단축</li>
  <li><strong>Partial Prerendering:</strong> 정적 페이지와 동적 콘텐츠의 하이브리드 렌더링</li>
  <li><strong>Next.js Cache API:</strong> 더 세밀한 캐싱 제어</li>
</ul>

<h2>성능 개선</h2>
<p>이번 업데이트에서 가장 큰 변화는 성능 개선입니다. 특히 초기 로딩 시간이 평균 30% 단축되었고, 번들 크기도 최적화되었습니다. 또한 이미지 최적화 기능도 개선되어 더 빠른 이미지 로딩이 가능합니다.</p>

<h2>마이그레이션 가이드</h2>
<p>기존 Next.js 14 프로젝트를 Next.js 15로 업그레이드하는 것은 비교적 간단합니다. 대부분의 경우 호환성 문제 없이 업그레이드할 수 있지만, 일부 deprecated된 API를 사용하는 경우 주의가 필요합니다.</p>`,
    created_at: "2024-10-30T00:00:00Z",
    updated_at: "2024-10-30T00:00:00Z",
  },
  {
    id: "2",
    title: "TypeScript 타입 시스템 깊이 이해하기",
    description: "TypeScript의 강력한 타입 시스템을 활용하여 더 안전하고 예측 가능한 코드를 작성하는 방법을 알아봅니다.",
    category: "기술",
    subCategory: "클로드 코드",
    date: "2024년 10월 22일",
    tags: ["TypeScript", "타입 시스템", "개발"],
    technologies: ["TypeScript"],
    difficulty: "중급",
    viewCount: 987,
    commentCount: 19,
    content: `<p>TypeScript의 타입 시스템은 JavaScript에 정적 타입 체크를 추가하여 개발 시점에 오류를 발견할 수 있게 해줍니다. 타입 시스템을 제대로 이해하고 활용하면 더 안전하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.</p>

<h2>타입 시스템의 기본</h2>
<p>TypeScript의 타입 시스템은 구조적 타이핑을 기반으로 합니다. 이는 명시적인 타입 선언보다는 객체의 구조를 기반으로 타입을 판단한다는 의미입니다.</p>

<h2>고급 타입 활용</h2>
<ul>
  <li><strong>제네릭:</strong> 재사용 가능한 타입 정의</li>
  <li><strong>조건부 타입:</strong> 조건에 따라 타입을 결정</li>
  <li><strong>매핑 타입:</strong> 기존 타입을 기반으로 새로운 타입 생성</li>
  <li><strong>템플릿 리터럴 타입:</strong> 문자열 타입 조작</li>
</ul>

<h2>실전 활용 예제</h2>
<p>타입 시스템을 활용하여 API 응답 타입을 안전하게 정의하거나, 유틸리티 타입을 만들어 코드 중복을 줄일 수 있습니다. 또한 타입 가드를 활용하여 런타임 타입 체크를 구현할 수 있습니다.</p>

<h2>베스트 프랙티스</h2>
<p>타입을 너무 엄격하게 만들지 말고, 필요한 만큼만 타입을 적용하는 것이 중요합니다. 또한 any 타입을 피하고, unknown 타입을 활용하여 더 안전한 타입 체크를 구현하는 것이 좋습니다.</p>`,
    created_at: "2024-10-22T00:00:00Z",
    updated_at: "2024-10-22T00:00:00Z",
  },
  {
    id: "3",
    title: "React Server Components 실전 가이드",
    description: "React Server Components의 개념부터 실제 프로젝트 적용까지. 성능 최적화와 사용자 경험 개선을 위한 실용적인 접근법을 다룹니다.",
    category: "기술",
    subCategory: "클로드 코드",
    date: "2024년 10월 18일",
    tags: ["React", "Server Components", "성능 최적화"],
    technologies: ["React", "Next.js"],
    difficulty: "고급",
    viewCount: 2134,
    commentCount: 45,
    content: `<p>React Server Components는 React의 혁신적인 기능으로, 서버에서 컴포넌트를 렌더링하여 번들 크기를 줄이고 초기 로딩 시간을 단축합니다. 이 기술을 제대로 이해하고 활용하면 웹 애플리케이션의 성능을 크게 향상시킬 수 있습니다.</p>

<h2>Server Components란?</h2>
<p>Server Components는 서버에서만 실행되는 컴포넌트입니다. 클라이언트로 전송되지 않기 때문에 번들 크기에 포함되지 않으며, 데이터베이스나 파일 시스템에 직접 접근할 수 있습니다.</p>

<h2>Client Components와의 차이</h2>
<ul>
  <li><strong>Server Components:</strong> 서버에서만 실행, 번들 크기 최소화</li>
  <li><strong>Client Components:</strong> 브라우저에서 실행, 인터랙티브 기능 제공</li>
  <li><strong>하이브리드 접근:</strong> 두 가지를 적절히 조합하여 최적의 성능 달성</li>
</ul>

<h2>실전 적용 사례</h2>
<p>Server Components는 정적 콘텐츠, 데이터 페칭, 데이터베이스 쿼리 등에 적합합니다. 반면 사용자 인터랙션, 상태 관리, 브라우저 API 사용이 필요한 경우에는 Client Components를 사용해야 합니다.</p>

<h2>성능 최적화 팁</h2>
<p>Server Components를 최대한 활용하고, 필요한 경우에만 Client Components를 사용하는 것이 성능 최적화의 핵심입니다. 또한 데이터 페칭을 Server Components에서 처리하면 클라이언트의 JavaScript 번들이 작아집니다.</p>`,
    created_at: "2024-10-18T00:00:00Z",
    updated_at: "2024-10-18T00:00:00Z",
  },
  {
    id: "4",
    title: "LLM 기반 질의응답 시스템 구축",
    description: "OpenAI API를 활용한 자연어 처리 기술을 적용하여 고객 지원 챗봇을 개발했습니다.",
    category: "기술",
    subCategory: "인공지능 활용",
    date: "2024년 10월 15일",
    tags: ["LLM", "NLP", "Generative AI", "Chatbot"],
    technologies: ["OpenAI API", "FastAPI", "React"],
    difficulty: "고급",
    viewCount: 2876,
    commentCount: 52,
    content: `<p>대규모 언어 모델(LLM)을 활용하여 질의응답 시스템을 구축하는 것은 최근 가장 주목받는 AI 활용 사례 중 하나입니다. 이 기술을 통해 자연어로 질문을 받고 적절한 답변을 생성하는 시스템을 만들 수 있습니다.</p>

<h2>LLM 기반 시스템의 구성</h2>
<p>질의응답 시스템은 크게 세 가지 구성 요소로 나눌 수 있습니다: 사용자 입력 처리, LLM을 통한 답변 생성, 그리고 컨텍스트 관리입니다.</p>

<h2>핵심 기술 요소</h2>
<ul>
  <li><strong>프롬프트 엔지니어링:</strong> LLM에게 올바른 지시를 전달하는 기술</li>
  <li><strong>RAG (Retrieval-Augmented Generation):</strong> 외부 지식을 활용한 답변 생성</li>
  <li><strong>컨텍스트 관리:</strong> 대화 이력을 유지하여 연속적인 대화 지원</li>
  <li><strong>스트리밍 응답:</strong> 실시간으로 답변을 생성하여 사용자 경험 개선</li>
</ul>

<h2>실전 구현 방법</h2>
<p>OpenAI API를 활용하여 GPT 모델을 통합하고, FastAPI로 백엔드 API를 구축합니다. 프롬프트 템플릿을 설계하여 일관된 응답을 생성하고, 벡터 데이터베이스를 활용하여 관련 문서를 검색합니다.</p>

<h2>최적화 전략</h2>
<p>토큰 사용량을 줄이기 위해 컨텍스트를 효율적으로 관리하고, 캐싱을 활용하여 반복적인 질문에 빠르게 응답할 수 있습니다. 또한 미세 조정을 통해 특정 도메인에 최적화된 모델을 만들 수 있습니다.</p>`,
    created_at: "2024-10-15T00:00:00Z",
    updated_at: "2024-10-15T00:00:00Z",
  },
  {
    id: "5",
    title: "컴퓨터 비전 기반 이미지 분석",
    description: "딥러닝을 활용한 이미지 인식 및 분석 기술을 구현하는 방법을 소개합니다.",
    category: "기술",
    subCategory: "인공지능 활용",
    date: "2024년 10월 12일",
    tags: ["Computer Vision", "딥러닝", "이미지 처리"],
    technologies: ["Python", "TensorFlow", "OpenCV"],
    difficulty: "고급",
    viewCount: 1923,
    commentCount: 34,
    content: `<p>컴퓨터 비전은 컴퓨터가 이미지나 비디오를 이해하고 분석하는 기술입니다. 딥러닝의 발전으로 이미지 인식, 객체 탐지, 이미지 분할 등의 작업에서 인간 수준의 성능을 달성할 수 있게 되었습니다.</p>

<h2>컴퓨터 비전의 기본 개념</h2>
<p>컴퓨터 비전은 이미지를 픽셀 데이터로 변환하고, 특징을 추출하여 의미 있는 정보를 얻는 과정입니다. 딥러닝, 특히 CNN(Convolutional Neural Network)이 이러한 작업을 획기적으로 개선했습니다.</p>

<h2>주요 응용 분야</h2>
<ul>
  <li><strong>이미지 분류:</strong> 이미지가 어떤 카테고리에 속하는지 판단</li>
  <li><strong>객체 탐지:</strong> 이미지 내에서 특정 객체의 위치와 종류를 찾아냄</li>
  <li><strong>이미지 분할:</strong> 이미지를 의미 있는 영역으로 나눔</li>
  <li><strong>이미지 생성:</strong> GAN이나 Diffusion 모델을 활용한 이미지 생성</li>
</ul>

<h2>모델 학습 방법</h2>
<p>이미지 분류나 객체 탐지 모델을 학습시키기 위해서는 대량의 레이블링된 데이터가 필요합니다. 전이 학습이나 데이터 증강 기법을 활용하면 비교적 적은 데이터로도 좋은 성능을 얻을 수 있습니다.</p>

<h2>실전 활용 예제</h2>
<p>OpenCV와 TensorFlow를 활용하여 이미지 전처리, 모델 학습, 추론 파이프라인을 구축할 수 있습니다. 실시간 객체 탐지나 이미지 필터링 등의 애플리케이션을 구현할 수 있습니다.</p>`,
    created_at: "2024-10-12T00:00:00Z",
    updated_at: "2024-10-12T00:00:00Z",
  },
  {
    id: "6",
    title: "자연어 처리 기초",
    description: "자연어 처리는 컴퓨터가 인간의 언어를 이해하는 기술입니다. 기본 개념부터 실전 활용까지 다룹니다.",
    category: "기술",
    subCategory: "인공지능 활용",
    date: "2024년 10월 8일",
    tags: ["NLP", "자연어 처리", "AI"],
    technologies: ["Python", "spaCy", "Transformers"],
    difficulty: "중급",
    viewCount: 1156,
    commentCount: 22,
    content: `<p>자연어 처리(NLP)는 컴퓨터가 인간의 언어를 이해하고 처리하는 기술입니다. 최근 Transformer 아키텍처의 발전으로 텍스트 이해, 생성, 번역 등의 작업에서 놀라운 성과를 보이고 있습니다.</p>

<h2>자연어 처리의 기본 개념</h2>
<p>자연어 처리는 텍스트를 토큰화하고, 의미를 추출하며, 문맥을 이해하는 과정을 포함합니다. 토큰화, 형태소 분석, 구문 분석 등의 전처리 단계가 중요합니다.</p>

<h2>주요 작업들</h2>
<ul>
  <li><strong>텍스트 분류:</strong> 문서나 문장을 카테고리로 분류</li>
  <li><strong>감정 분석:</strong> 텍스트의 감정이나 의견을 분석</li>
  <li><strong>개체명 인식:</strong> 텍스트에서 사람, 장소, 조직 등의 개체명 추출</li>
  <li><strong>기계 번역:</strong> 한 언어에서 다른 언어로 번역</li>
</ul>

<h2>Transformer 모델 활용</h2>
<p>BERT, GPT, T5 등의 Transformer 모델은 사전 학습된 모델을 활용하여 다양한 NLP 작업에 적용할 수 있습니다. Hugging Face의 Transformers 라이브러리를 활용하면 쉽게 이러한 모델을 사용할 수 있습니다.</p>

<h2>실전 활용 예제</h2>
<p>spaCy를 활용하여 텍스트 전처리와 기본적인 NLP 작업을 수행하고, Transformers 라이브러리를 활용하여 고급 모델을 적용할 수 있습니다. 감정 분석, 텍스트 요약, 질의응답 등의 실제 애플리케이션을 구현할 수 있습니다.</p>`,
    created_at: "2024-10-08T00:00:00Z",
    updated_at: "2024-10-08T00:00:00Z",
  },
  {
    id: "7",
    title: "Claude Code로 개발 생산성 10배 높이기",
    description: "AI 코딩 어시스턴트 Claude Code를 활용한 효율적인 개발 워크플로우",
    category: "기술",
    subCategory: "클로드 코드",
    date: "2024년 10월 5일",
    tags: ["Claude Code", "AI 개발 도구", "생산성"],
    technologies: ["Claude Code", "VS Code", "Git"],
    difficulty: "초급",
    viewCount: 3421,
    commentCount: 67,
    content: `<p>Claude Code는 Anthropic이 개발한 AI 코딩 어시스턴트로, 개발자의 생산성을 크게 향상시킬 수 있는 강력한 도구입니다. 단순한 코드 자동완성을 넘어 전체 프로젝트의 컨텍스트를 이해하고 복잡한 작업을 수행할 수 있습니다.</p>

<h2>Claude Code란?</h2>
<p>Claude Code는 대화형 방식으로 코드를 작성하고, 리팩토링하며, 버그를 찾는 AI 어시스턴트입니다. 프로젝트 구조를 이해하고 베스트 프랙티스를 따르며 코드를 생성합니다.</p>

<h2>주요 활용 사례</h2>
<ul>
  <li><strong>코드 생성:</strong> 요구사항을 자연어로 설명하면 완전한 코드 작성</li>
  <li><strong>리팩토링:</strong> 기존 코드를 더 깔끔하고 효율적으로 개선</li>
  <li><strong>버그 수정:</strong> 에러 메시지를 분석하고 해결책 제시</li>
  <li><strong>테스트 작성:</strong> 자동으로 유닛 테스트 생성</li>
  <li><strong>문서화:</strong> 코드에 대한 상세한 문서 작성</li>
</ul>

<h2>효과적인 사용 팁</h2>
<p>Claude Code를 효과적으로 사용하려면 명확한 요구사항 전달이 중요합니다. 프로젝트의 맥락을 설명하고, 원하는 결과를 구체적으로 명시하면 더 정확한 결과를 얻을 수 있습니다.</p>

<h2>실전 예제</h2>
<p>React 컴포넌트 생성, API 엔드포인트 구현, 데이터베이스 스키마 설계 등 다양한 작업에서 Claude Code를 활용할 수 있습니다. 특히 반복적인 작업이나 보일러플레이트 코드 작성에서 큰 효과를 발휘합니다.</p>`,
    created_at: "2024-10-05T00:00:00Z",
    updated_at: "2024-10-05T00:00:00Z",
  },
  {
    id: "8",
    title: "Tailwind CSS 마스터하기",
    description: "유틸리티 우선 CSS 프레임워크로 빠르게 UI 구축하기",
    category: "기술",
    subCategory: "클로드 코드",
    date: "2024년 10월 2일",
    tags: ["Tailwind CSS", "CSS", "UI 디자인"],
    technologies: ["Tailwind CSS", "PostCSS"],
    difficulty: "초급",
    viewCount: 2187,
    commentCount: 41,
    content: `<p>Tailwind CSS는 유틸리티 클래스를 활용하여 빠르게 UI를 구축할 수 있는 CSS 프레임워크입니다. 커스텀 CSS를 작성하지 않고도 복잡한 디자인을 구현할 수 있습니다.</p>

<h2>Tailwind CSS의 장점</h2>
<p>전통적인 CSS와 달리 Tailwind는 미리 정의된 유틸리티 클래스를 조합하여 스타일을 적용합니다. 이로 인해 CSS 파일의 크기가 작아지고, 스타일 충돌이 줄어듭니다.</p>

<h2>핵심 개념</h2>
<ul>
  <li><strong>유틸리티 클래스:</strong> 각각의 클래스가 하나의 CSS 속성을 담당</li>
  <li><strong>반응형 디자인:</strong> 브레이크포인트 프리픽스로 쉽게 구현</li>
  <li><strong>다크 모드:</strong> dark: 프리픽스로 간단하게 지원</li>
  <li><strong>커스터마이징:</strong> tailwind.config.js로 테마 커스터마이징</li>
</ul>

<h2>실전 활용</h2>
<p>버튼, 카드, 폼 등 일반적인 UI 컴포넌트를 Tailwind로 빠르게 구현할 수 있습니다. Flexbox와 Grid 유틸리티를 활용하면 복잡한 레이아웃도 쉽게 만들 수 있습니다.</p>

<h2>성능 최적화</h2>
<p>PurgeCSS를 통해 사용하지 않는 클래스를 제거하여 프로덕션 번들 크기를 최소화할 수 있습니다. Tailwind v3부터는 JIT(Just-In-Time) 컴파일러를 통해 더 빠른 빌드 속도를 제공합니다.</p>`,
    created_at: "2024-10-02T00:00:00Z",
    updated_at: "2024-10-02T00:00:00Z",
  },
  {
    id: "9",
    title: "Prompt Engineering 완벽 가이드",
    description: "효과적인 프롬프트 작성으로 AI 성능 극대화하기",
    category: "기술",
    subCategory: "인공지능 활용",
    date: "2024년 9월 28일",
    tags: ["Prompt Engineering", "LLM", "AI"],
    technologies: ["ChatGPT", "Claude", "Gemini"],
    difficulty: "중급",
    viewCount: 3567,
    commentCount: 72,
    content: `<p>프롬프트 엔지니어링은 AI 언어 모델로부터 원하는 결과를 얻기 위해 효과적인 입력을 설계하는 기술입니다. 좋은 프롬프트는 AI의 성능을 극대화하고 정확한 결과를 얻을 수 있게 합니다.</p>

<h2>프롬프트 엔지니어링의 중요성</h2>
<p>같은 AI 모델이라도 프롬프트를 어떻게 작성하느냐에 따라 결과의 품질이 크게 달라집니다. 명확하고 구체적인 프롬프트는 더 정확하고 유용한 응답을 이끌어냅니다.</p>

<h2>효과적인 프롬프트 작성 기법</h2>
<ul>
  <li><strong>명확한 지시:</strong> 원하는 결과를 구체적으로 명시</li>
  <li><strong>예시 제공:</strong> Few-shot learning으로 패턴 학습</li>
  <li><strong>역할 부여:</strong> AI에게 특정 전문가 역할 부여</li>
  <li><strong>단계별 사고:</strong> Chain-of-Thought로 복잡한 문제 해결</li>
  <li><strong>제약 조건:</strong> 응답 형식이나 길이 제한 명시</li>
</ul>

<h2>실전 프롬프트 패턴</h2>
<p>코드 생성, 텍스트 요약, 번역, 데이터 분석 등 각 용도에 맞는 프롬프트 패턴이 있습니다. 상황에 맞는 패턴을 선택하고 커스터마이징하여 사용하면 효과적입니다.</p>

<h2>주의사항</h2>
<p>프롬프트가 너무 복잡하거나 모호하면 오히려 결과가 나빠질 수 있습니다. 간결하면서도 명확한 프롬프트를 작성하는 것이 중요합니다.</p>`,
    created_at: "2024-09-28T00:00:00Z",
    updated_at: "2024-09-28T00:00:00Z",
  },
  {
    id: "10",
    title: "RAG 시스템 구축하기",
    description: "검색 증강 생성으로 정확한 AI 답변 만들기",
    category: "기술",
    subCategory: "인공지능 활용",
    date: "2024년 9월 25일",
    tags: ["RAG", "Vector DB", "LLM"],
    technologies: ["LangChain", "Pinecone", "OpenAI"],
    difficulty: "고급",
    viewCount: 2943,
    commentCount: 58,
    content: `<p>RAG(Retrieval-Augmented Generation)는 외부 지식을 검색하여 LLM의 응답에 활용하는 기술입니다. 이를 통해 최신 정보를 활용하고, 환각(hallucination)을 줄이며, 특정 도메인에 특화된 답변을 생성할 수 있습니다.</p>

<h2>RAG 시스템의 구조</h2>
<p>RAG 시스템은 크게 문서 임베딩, 벡터 저장, 유사도 검색, 컨텍스트 생성, LLM 응답 생성의 5단계로 구성됩니다. 각 단계를 최적화하여 전체 시스템의 성능을 향상시킬 수 있습니다.</p>

<h2>구현 단계</h2>
<ul>
  <li><strong>문서 준비:</strong> 텍스트를 청크로 분할하고 임베딩 생성</li>
  <li><strong>벡터 DB:</strong> Pinecone, Weaviate 등에 임베딩 저장</li>
  <li><strong>검색:</strong> 쿼리와 유사한 문서 검색</li>
  <li><strong>컨텍스트 구성:</strong> 검색된 문서를 프롬프트에 포함</li>
  <li><strong>답변 생성:</strong> LLM이 컨텍스트를 참고하여 응답 생성</li>
</ul>

<h2>성능 최적화</h2>
<p>청크 크기, 임베딩 모델 선택, 검색 알고리즘, 재순위화(re-ranking) 등을 조정하여 RAG 시스템의 정확도를 향상시킬 수 있습니다.</p>

<h2>실전 활용 사례</h2>
<p>사내 문서 검색, 고객 지원 챗봇, 법률 문서 분석, 의료 정보 제공 등 다양한 분야에서 RAG 시스템을 활용할 수 있습니다.</p>`,
    created_at: "2024-09-25T00:00:00Z",
    updated_at: "2024-09-25T00:00:00Z",
  },
  {
    id: "11",
    title: "GitHub Actions로 CI/CD 자동화",
    description: "효율적인 배포 파이프라인 구축하기",
    category: "기술",
    subCategory: "web",
    date: "2024년 9월 20일",
    tags: ["CI/CD", "GitHub Actions", "DevOps"],
    technologies: ["GitHub Actions", "Docker", "Vercel"],
    difficulty: "중급",
    viewCount: 1876,
    commentCount: 33,
    content: `<p>GitHub Actions는 코드 저장소에서 직접 CI/CD 파이프라인을 구축할 수 있는 강력한 도구입니다. 테스트 자동화, 빌드, 배포까지 모든 과정을 자동화하여 개발 생산성을 높일 수 있습니다.</p>

<h2>CI/CD의 필요성</h2>
<p>수동 배포는 시간이 많이 걸리고 실수가 발생하기 쉽습니다. CI/CD를 통해 코드 변경사항을 자동으로 테스트하고 배포하면 안정성과 속도를 모두 향상시킬 수 있습니다.</p>

<h2>GitHub Actions 기본 구조</h2>
<ul>
  <li><strong>Workflow:</strong> .github/workflows 폴더의 YAML 파일</li>
  <li><strong>Trigger:</strong> push, pull request 등의 이벤트</li>
  <li><strong>Job:</strong> 순차적 또는 병렬로 실행되는 작업</li>
  <li><strong>Step:</strong> Job 내의 개별 명령어</li>
</ul>

<h2>실전 워크플로우 예제</h2>
<p>테스트 실행, 린트 체크, 빌드, Docker 이미지 생성, 배포 등의 단계를 자동화할 수 있습니다. 조건부 실행, 환경 변수, 시크릿 관리 등의 고급 기능도 활용 가능합니다.</p>

<h2>베스트 프랙티스</h2>
<p>캐싱을 활용하여 빌드 시간을 단축하고, 병렬 실행으로 효율성을 높이며, 실패 시 알림을 설정하여 빠르게 대응할 수 있습니다.</p>`,
    created_at: "2024-09-20T00:00:00Z",
    updated_at: "2024-09-20T00:00:00Z",
  },
]

