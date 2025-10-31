-- =====================================================
-- Archive 초기 데이터 삽입
-- =====================================================
-- 설명: Mock 데이터를 기반으로 초기 아카이브 데이터 삽입
-- Projects: 8개, Skills: 11개 삽입
-- =====================================================

-- =====================================================
-- PROJECTS (8개)
-- =====================================================

INSERT INTO archive_items (id, title, description, image, category, date, tags, technologies, difficulty, view_count, comment_count, content, created_at, updated_at) VALUES
('1', 'AI 챗봇 플랫폼', '고객 서비스를 위한 지능형 챗봇 솔루션', '/ai-chatbot-interface-icon.jpg', '프로젝트', '2024년 3월 15일',
  ARRAY['AI', '챗봇', '고객서비스'],
  ARRAY['React', 'Python', 'OpenAI API'],
  '중급', 1240, 23,
  '<p>고객 서비스의 효율성을 높이기 위해 AI 기반 챗봇 플랫폼을 개발했습니다. 이 플랫폼은 자연어 처리 기술을 활용하여 고객의 문의를 실시간으로 이해하고 적절한 답변을 제공합니다.</p>

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
<p>이 플랫폼을 도입한 이후 고객 응답 시간이 평균 2분에서 10초로 단축되었고, 고객 만족도가 15% 향상되었습니다. 또한 고객 서비스 담당자의 업무 부담이 줄어들어 더 복잡한 문의에 집중할 수 있게 되었습니다.</p>',
  '2024-03-15T00:00:00Z', '2024-03-15T00:00:00Z'),

('2', '데이터 분석 대시보드', '실시간 데이터 시각화 및 인사이트 도구', '/data-analytics-dashboard-icon.jpg', '프로젝트', '2024년 3월 10일',
  ARRAY['데이터 분석', '시각화', '대시보드'],
  ARRAY['React', 'TypeScript', 'Chart.js'],
  '중급', 892, 15,
  '<p>비즈니스 의사결정을 지원하기 위해 실시간 데이터를 시각화하고 인사이트를 제공하는 대시보드를 개발했습니다. 다양한 데이터 소스를 통합하여 한눈에 파악할 수 있는 인터페이스를 제공합니다.</p>

<h2>프로젝트 목표</h2>
<p>기존에는 여러 시스템에서 데이터를 수집하고 Excel로 정리하는 과정이 번거로웠습니다. 이를 자동화하고 실시간으로 업데이트되는 대시보드를 통해 더 빠른 의사결정을 지원하고자 했습니다.</p>

<h2>핵심 기능</h2>
<ul>
  <li><strong>실시간 데이터 수집:</strong> 다양한 API와 데이터베이스에서 자동으로 데이터 수집</li>
  <li><strong>인터랙티브 차트:</strong> 사용자가 원하는 기간과 필터를 선택하여 데이터 탐색</li>
  <li><strong>알림 시스템:</strong> 특정 임계값을 넘으면 자동으로 알림 전송</li>
  <li><strong>다양한 차트 타입:</strong> 선형, 막대형, 파이 차트 등 상황에 맞는 시각화</li>
</ul>',
  '2024-03-10T00:00:00Z', '2024-03-10T00:00:00Z'),

('3', '이미지 생성 AI', '텍스트로 고품질 이미지를 생성하는 도구', '/image-generation-ai-tool-icon.jpg', '프로젝트', '2024년 3월 5일',
  ARRAY['AI', '이미지 생성', '머신러닝'],
  ARRAY['Python', 'TensorFlow', 'React'],
  '고급', 2156, 42,
  '<p>텍스트 입력만으로 고품질 이미지를 생성하는 AI 도구를 개발했습니다. Stable Diffusion 모델을 활용하여 사용자의 창의성을 지원하고 다양한 스타일의 이미지를 생성할 수 있습니다.</p>',
  '2024-03-05T00:00:00Z', '2024-03-05T00:00:00Z'),

('4', '음성 비서 시스템', '자연스러운 대화가 가능한 음성 AI', '/voice-assistant-ai-icon.jpg', '프로젝트', '2024년 2월 28일',
  ARRAY['AI', '음성인식', 'NLP'],
  ARRAY['Python', 'Speech Recognition', 'FastAPI'],
  '고급', 1834, 31,
  '<p>음성으로 자연스럽게 대화할 수 있는 AI 비서 시스템을 개발했습니다. 음성 인식, 자연어 처리, 음성 합성 기술을 통합하여 사용자와 상호작용합니다.</p>',
  '2024-02-28T00:00:00Z', '2024-02-28T00:00:00Z'),

('ai-content', 'AI 기반 콘텐츠 생성 플랫폼', '최신 AI 기술을 활용하여 고품질 콘텐츠를 자동으로 생성하는 혁신적인 플랫폼입니다.', '/modern-ai-content-generation-platform-dashboard-in.jpg', '프로젝트', '2024년 3월 15일',
  ARRAY['인공지능', '머신러닝', '자연어처리', '웹 개발', '클라우드'],
  ARRAY['Next.js', 'TypeScript', 'Python', 'TensorFlow', 'PostgreSQL', 'Redis'],
  '고급', 3245, 67,
  '<p>최신 AI 기술을 활용하여 블로그 포스트, 마케팅 콘텐츠, 소셜 미디어 게시물 등을 자동으로 생성하는 플랫폼을 개발했습니다.</p>',
  '2024-03-15T00:00:00Z', '2024-03-15T00:00:00Z'),

('6', '사내 CRM 시스템 구축', '고객 관계 관리를 위한 통합 솔루션', '/crm-dashboard-interface.jpg', '프로젝트', '2024년 2월 20일',
  ARRAY['CRM', '사내시스템', '업무자동화'],
  ARRAY['Next.js', 'PostgreSQL', 'Prisma', 'Redis'],
  '중급', 678, 12,
  '<p>영업팀과 고객지원팀의 업무 효율을 높이기 위해 통합 CRM 시스템을 구축했습니다.</p>',
  '2024-02-20T00:00:00Z', '2024-02-20T00:00:00Z'),

('7', '전자상거래 플랫폼 구축', '확장 가능한 온라인 쇼핑몰 플랫폼', '/ecommerce-platform-screenshot.jpg', '프로젝트', '2024년 2월 15일',
  ARRAY['E-commerce', 'Web', '결제시스템'],
  ARRAY['Next.js', 'Stripe', 'Vercel', 'Supabase'],
  '고급', 2543, 48,
  '<p>현대적인 사용자 경험과 안정적인 결제 시스템을 갖춘 전자상거래 플랫폼을 구축했습니다.</p>',
  '2024-02-15T00:00:00Z', '2024-02-15T00:00:00Z'),

('8', '실시간 협업 도구', '팀 협업을 위한 실시간 문서 편집 플랫폼', '/collaborative-editor-interface.jpg', '프로젝트', '2024년 2월 5일',
  ARRAY['실시간 협업', 'WebSocket', '문서 편집'],
  ARRAY['Next.js', 'WebSocket', 'Yjs', 'MongoDB'],
  '고급', 1789, 36,
  '<p>여러 사용자가 동시에 문서를 편집할 수 있는 실시간 협업 플랫폼을 개발했습니다.</p>',
  '2024-02-05T00:00:00Z', '2024-02-05T00:00:00Z');

-- =====================================================
-- SKILLS (11개)
-- =====================================================

INSERT INTO archive_items (id, title, description, category, sub_category, date, tags, technologies, difficulty, view_count, comment_count, content, created_at, updated_at) VALUES
('skill-1', 'Next.js 15의 새로운 기능들', 'Next.js 15에서 추가된 주요 기능들과 성능 개선 사항을 살펴봅니다.', '기술', '클로드 코드', '2024년 10월 30일',
  ARRAY['Next.js', 'React', '웹 개발'],
  ARRAY['Next.js', 'React', 'TypeScript'],
  '중급', 1542, 28,
  '<p>Next.js 15가 출시되면서 많은 새로운 기능들과 성능 개선이 이루어졌습니다. 이번 업데이트는 개발자 경험과 애플리케이션 성능을 크게 향상시킵니다.</p>

<h2>주요 변경사항</h2>
<p>Next.js 15는 React 19와 완전히 통합되어 새로운 기능들을 활용할 수 있습니다. 특히 Server Components의 성능이 크게 개선되었고, 빌드 시간도 단축되었습니다.</p>

<h2>새로운 기능들</h2>
<ul>
  <li><strong>향상된 Server Components:</strong> 더 빠른 렌더링과 최적화된 번들 크기</li>
  <li><strong>개선된 Turbopack:</strong> 개발 서버 시작 시간이 50% 단축</li>
  <li><strong>Partial Prerendering:</strong> 정적 페이지와 동적 콘텐츠의 하이브리드 렌더링</li>
  <li><strong>Next.js Cache API:</strong> 더 세밀한 캐싱 제어</li>
</ul>',
  '2024-10-30T00:00:00Z', '2024-10-30T00:00:00Z'),

('skill-2', 'TypeScript 타입 시스템 깊이 이해하기', 'TypeScript의 강력한 타입 시스템을 활용하여 더 안전하고 예측 가능한 코드를 작성하는 방법을 알아봅니다.', '기술', '클로드 코드', '2024년 10월 22일',
  ARRAY['TypeScript', '타입 시스템', '개발'],
  ARRAY['TypeScript'],
  '중급', 987, 19,
  '<p>TypeScript의 타입 시스템은 JavaScript에 정적 타입 체크를 추가하여 개발 시점에 오류를 발견할 수 있게 해줍니다.</p>',
  '2024-10-22T00:00:00Z', '2024-10-22T00:00:00Z'),

('skill-3', 'React Server Components 실전 가이드', 'React Server Components의 개념부터 실제 프로젝트 적용까지. 성능 최적화와 사용자 경험 개선을 위한 실용적인 접근법을 다룹니다.', '기술', '클로드 코드', '2024년 10월 18일',
  ARRAY['React', 'Server Components', '성능 최적화'],
  ARRAY['React', 'Next.js'],
  '고급', 2134, 45,
  '<p>React Server Components는 React의 혁신적인 기능으로, 서버에서 컴포넌트를 렌더링하여 번들 크기를 줄이고 초기 로딩 시간을 단축합니다.</p>',
  '2024-10-18T00:00:00Z', '2024-10-18T00:00:00Z'),

('skill-4', 'LLM 기반 질의응답 시스템 구축', 'OpenAI API를 활용한 자연어 처리 기술을 적용하여 고객 지원 챗봇을 개발했습니다.', '기술', '인공지능 활용', '2024년 10월 15일',
  ARRAY['LLM', 'NLP', 'Generative AI', 'Chatbot'],
  ARRAY['OpenAI API', 'FastAPI', 'React'],
  '고급', 2876, 52,
  '<p>대규모 언어 모델(LLM)을 활용하여 질의응답 시스템을 구축하는 것은 최근 가장 주목받는 AI 활용 사례 중 하나입니다.</p>',
  '2024-10-15T00:00:00Z', '2024-10-15T00:00:00Z'),

('skill-5', '컴퓨터 비전 기반 이미지 분석', '딥러닝을 활용한 이미지 인식 및 분석 기술을 구현하는 방법을 소개합니다.', '기술', '인공지능 활용', '2024년 10월 12일',
  ARRAY['Computer Vision', '딥러닝', '이미지 처리'],
  ARRAY['Python', 'TensorFlow', 'OpenCV'],
  '고급', 1923, 34,
  '<p>컴퓨터 비전은 컴퓨터가 이미지나 비디오를 이해하고 분석하는 기술입니다.</p>',
  '2024-10-12T00:00:00Z', '2024-10-12T00:00:00Z'),

('skill-6', '자연어 처리 기초', '자연어 처리는 컴퓨터가 인간의 언어를 이해하는 기술입니다. 기본 개념부터 실전 활용까지 다룹니다.', '기술', '인공지능 활용', '2024년 10월 8일',
  ARRAY['NLP', '자연어 처리', 'AI'],
  ARRAY['Python', 'spaCy', 'Transformers'],
  '중급', 1156, 22,
  '<p>자연어 처리(NLP)는 컴퓨터가 인간의 언어를 이해하고 처리하는 기술입니다.</p>',
  '2024-10-08T00:00:00Z', '2024-10-08T00:00:00Z'),

('skill-7', 'Claude Code로 개발 생산성 10배 높이기', 'AI 코딩 어시스턴트 Claude Code를 활용한 효율적인 개발 워크플로우', '기술', '클로드 코드', '2024년 10월 5일',
  ARRAY['Claude Code', 'AI 개발 도구', '생산성'],
  ARRAY['Claude Code', 'VS Code', 'Git'],
  '초급', 3421, 67,
  '<p>Claude Code는 Anthropic이 개발한 AI 코딩 어시스턴트로, 개발자의 생산성을 크게 향상시킬 수 있는 강력한 도구입니다.</p>',
  '2024-10-05T00:00:00Z', '2024-10-05T00:00:00Z'),

('skill-8', 'Tailwind CSS 마스터하기', '유틸리티 우선 CSS 프레임워크로 빠르게 UI 구축하기', '기술', '클로드 코드', '2024년 10월 2일',
  ARRAY['Tailwind CSS', 'CSS', 'UI 디자인'],
  ARRAY['Tailwind CSS', 'PostCSS'],
  '초급', 2187, 41,
  '<p>Tailwind CSS는 유틸리티 클래스를 활용하여 빠르게 UI를 구축할 수 있는 CSS 프레임워크입니다.</p>',
  '2024-10-02T00:00:00Z', '2024-10-02T00:00:00Z'),

('skill-9', 'Prompt Engineering 완벽 가이드', '효과적인 프롬프트 작성으로 AI 성능 극대화하기', '기술', '인공지능 활용', '2024년 9월 28일',
  ARRAY['Prompt Engineering', 'LLM', 'AI'],
  ARRAY['ChatGPT', 'Claude', 'Gemini'],
  '중급', 3567, 72,
  '<p>프롬프트 엔지니어링은 AI 언어 모델로부터 원하는 결과를 얻기 위해 효과적인 입력을 설계하는 기술입니다.</p>',
  '2024-09-28T00:00:00Z', '2024-09-28T00:00:00Z'),

('skill-10', 'RAG 시스템 구축하기', '검색 증강 생성으로 정확한 AI 답변 만들기', '기술', '인공지능 활용', '2024년 9월 25일',
  ARRAY['RAG', 'Vector DB', 'LLM'],
  ARRAY['LangChain', 'Pinecone', 'OpenAI'],
  '고급', 2943, 58,
  '<p>RAG(Retrieval-Augmented Generation)는 외부 지식을 검색하여 LLM의 응답에 활용하는 기술입니다.</p>',
  '2024-09-25T00:00:00Z', '2024-09-25T00:00:00Z'),

('skill-11', 'GitHub Actions로 CI/CD 자동화', '효율적인 배포 파이프라인 구축하기', '기술', 'web', '2024년 9월 20일',
  ARRAY['CI/CD', 'GitHub Actions', 'DevOps'],
  ARRAY['GitHub Actions', 'Docker', 'Vercel'],
  '중급', 1876, 33,
  '<p>GitHub Actions는 코드 저장소에서 직접 CI/CD 파이프라인을 구축할 수 있는 강력한 도구입니다.</p>',
  '2024-09-20T00:00:00Z', '2024-09-20T00:00:00Z');

-- =====================================================
-- 완료 메시지
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE 'Initial data seeding completed: % projects, % skills',
    (SELECT COUNT(*) FROM archive_items WHERE category = '프로젝트'),
    (SELECT COUNT(*) FROM archive_items WHERE category = '기술');
END $$;
