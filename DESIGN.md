---
version: "alpha"
name: "Light Archive"
description: "A quiet monochrome archive design system for Lightsoft technical articles, projects, and internal knowledge."
colors:
  primary: "#000000"
  on-primary: "#FFFFFF"
  background: "#FFFFFF"
  foreground: "#111111"
  muted: "#666666"
  muted-light: "#999999"
  surface: "#F8F8F8"
  surface-muted: "#F3F4F6"
  border: "#E5E7EB"
  glass: "rgba(255, 255, 255, 0.40)"
  destructive: "#DC2626"
typography:
  display:
    fontFamily: "Inter"
    fontSize: "3.75rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0px"
  title-lg:
    fontFamily: "Inter"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "0px"
  title-md:
    fontFamily: "Inter"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0px"
  body-md:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
  label:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0px"
  caption:
    fontFamily: "Inter"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0px"
  code:
    fontFamily: "Geist Mono"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0px"
rounded:
  none: "0px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
  sidebar:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.muted}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "#1F2937"
    textColor: "{colors.on-primary}"
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "8px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  badge:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-strong:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  metadata-on-dark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.muted-light}"
    typography: "{typography.caption}"
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.foreground}"
    height: "1px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  focus-state:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
---

## Overview

Light Archive는 Lightsoft의 기술 문서, 프로젝트 기록, 사내 지식을 차분하게 보여주는 아카이브 UI다. 디자인은 흑백 중심의 고대비 화면, 넓은 여백, 얇은 경계선, 반투명 블러 레이어를 사용한다.

이 문서는 `google-labs-code/design.md`의 DESIGN.md 형식을 따른다. 위 YAML 토큰은 에이전트와 도구가 읽는 기준값이고, 아래 설명은 사람이 의도를 이해하기 위한 적용 규칙이다.

기본 인상은 "기술 블로그"보다 "정리된 기술 아카이브"에 가깝다. 과한 장식, 강한 브랜드 컬러, 마케팅형 히어로보다 읽기 쉬운 정보 구조와 빠른 탐색을 우선한다.

## Colors

색상은 순수한 흰색 배경과 검정 텍스트를 중심으로 한다. 회색은 메타데이터, 보조 설명, 비활성 상태, 경계선에만 사용한다.

- `primary`는 주요 CTA, 활성 필터, 강조 배지에 사용한다.
- `background`는 페이지 기본 배경이다.
- `foreground`는 제목과 본문 핵심 텍스트에 사용한다.
- `muted`와 `muted-light`는 날짜, 카테고리, 보조 설명, 아이콘에 사용한다.
- `surface`와 `surface-muted`는 카드 hover, 입력 보조 배경, 코드 블록, 빈 상태에 사용한다.
- `glass`는 사이드바와 상단 내비게이션처럼 콘텐츠 위에 올라가는 레이어에만 사용한다.
- 기능 상태가 꼭 필요한 관리자 화면에서는 색상 배지를 허용하되, 사용자-facing 화면에는 검정/회색 계열을 우선한다.

## Typography

기본 폰트는 Inter다. 시스템 폰트 폴백은 브라우저 기본값을 따른다. 코드, 수치, 기술 식별자는 모노스페이스를 사용할 수 있지만 페이지 제목이나 카드 제목에는 사용하지 않는다.

제목은 굵기보다 크기와 여백으로 계층을 만든다. 큰 제목은 `font-weight: 400`을 기본으로 하고, 카드 제목과 버튼 라벨은 `500` 정도만 사용한다. `letter-spacing`은 0을 유지한다.

긴 제목에는 `text-balance` 또는 `text-pretty`를 사용해 줄바꿈을 안정화한다. 본문은 `line-height`를 넓게 잡아 읽기 편하게 유지한다.

## Layout

간격은 8px 그리드가 기준이다.

- 모바일: 0px-767px, 1열 레이아웃
- 태블릿: 768px-1023px, 2열 또는 여유 있는 단일 컬럼
- 데스크톱: 1024px 이상, 사이드바와 콘텐츠 영역 분리

본문 콘텐츠는 `max-width: 4xl` 수준을 유지해 문단 길이를 제한한다. 프로젝트와 기술 목록은 `max-width: 5xl` 수준에서 그리드와 리스트 뷰를 제공한다.

콘텐츠 영역은 항상 `min-w-0`과 `overflow-x-hidden`을 고려한다. 카드 내부 제목, 설명, 메타데이터는 `line-clamp`, `truncate`, `break-words`로 긴 텍스트를 처리한다.

## Elevation & Depth

기본 UI는 평면에 가깝게 둔다. 깊이는 큰 그림자보다 얇은 경계선, hover 배경, 반투명 블러로 표현한다.

- 상단 내비게이션과 사이드바는 `glass` 배경과 `backdrop-blur`를 사용한다.
- 추천 글, 목차 같은 부유 패널은 작은 그림자를 허용한다.
- 일반 카드에는 강한 그림자를 쓰지 않는다. hover에서는 배경색 변화나 얇은 border 변화만 사용한다.
- 배경용 radial gradient, orb, 과한 장식 패턴은 기본적으로 사용하지 않는다.

## Shapes

기본 반경은 8px다. 카드, 이미지 썸네일, 패널은 `rounded.md`를 우선한다.

버튼, 검색 입력, 작은 배지는 pill 형태를 사용할 수 있다. 단, 큰 콘텐츠 카드나 반복 카드에는 pill 또는 16px 이상의 과한 반경을 피한다.

## Components

버튼은 명확한 액션에만 사용한다. 페이지 이동은 `Link` 또는 `<a>`를 사용한다. 아이콘만 있는 버튼에는 반드시 `aria-label` 또는 `sr-only` 텍스트를 넣는다.

아이콘은 Lucide React를 기본으로 사용한다. 크기는 16px, 20px, 24px 중에서 고른다. 브랜드 아이콘처럼 Lucide에 없는 경우에만 직접 SVG를 허용한다.

카드는 콘텐츠 반복 항목, 모달, 도구 패널에만 사용한다. 페이지 섹션 전체를 카드처럼 감싸지 않는다.

이미지는 실제 프로젝트, 기술 문서, 아카이브 상태를 보여주는 용도로 사용한다. 썸네일은 16:9 비율을 기본으로 하고, `<img>`에는 `alt`, `width`, `height` 또는 안정적인 aspect-ratio를 제공한다.

폼 컨트롤은 `label`, `name`, 적절한 `type`, focus-visible 상태를 갖춰야 한다. 검색 입력은 pill 형태를 사용할 수 있고, clear 버튼에는 접근 가능한 이름을 제공한다.

## Do's and Don'ts

Do:

- 흰 배경, 검정 텍스트, 회색 메타데이터를 기본 조합으로 사용한다.
- 여백과 타이포그래피로 정보 계층을 만든다.
- CTA, 활성 상태, 주요 배지는 검정 배경과 흰 텍스트를 사용한다.
- hover, focus, active 상태를 명확히 제공한다.
- 반복 UI는 공통 컴포넌트 토큰을 우선 사용한다.

Don't:

- 사용자 화면에서 파랑, 보라, 노랑 같은 강한 상태 색상을 장식적으로 쓰지 않는다.
- 카드와 패널에 `rounded-2xl` 이상을 기본값처럼 사용하지 않는다.
- 제목에 모노스페이스를 사용하지 않는다. 코드와 숫자 중심 UI에만 제한한다.
- `transition-all`을 기본값으로 쓰지 않는다. 필요한 속성만 전환한다.
- `button`으로 외부 링크 이동을 처리하지 않는다. 링크 이동은 `<a>` 또는 `Link`를 사용한다.
