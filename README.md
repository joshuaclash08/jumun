# JUMUN (주문)

> **Accessible by Default** — QR/NFC로 바로 열리는, 모두를 위한 배리어프리(Barrier-Free) 셀프오더 플랫폼

[![Next.js](https://img.shields.io/badge/Next.js-16.3.1_(Turbopack)-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.3.14-fbf0df?logo=bun)](https://bun.sh/)
[![Tests](https://img.shields.io/badge/Vitest-126_passed_(12_suites)-green?logo=vitest)](https://vitest.dev/)
[![WCAG](https://img.shields.io/badge/A11y-WCAG_2.2_AA%2FAAA-purple)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 📖 Overview

**JUMUN (주문)**은 휠체어 사용자, 시각·저시력 장애인, 고령자, 난독증 사용자 등 **모든 사람이 타인의 도움 없이 자신의 스마트폰으로 주문과 결제를 완결할 수 있는 배리어프리(Barrier-Free) BYOD 셀프오더 웹 애플리케이션**입니다.

접근하기 어렵고 조작이 불편한 매장 설치형 키오스크 대신, 손님 각자의 스마트폰(자신에게 익숙한 스크린 리더, 글자 크기 등)으로 테이블의 **QR 코드나 NFC 태그**를 인식하여 즉시 주문 화면으로 진입합니다.

> 💡 **핵심 철학**: "장애인 전용 모드"나 "간편 모드"를 분리하지 않습니다. 토스(Toss) 디자인 시스템의 세련되고 직관적인 인터페이스 안에 접근성 표준(WCAG 2.2 AA/AAA)을 **기본값(Default)**으로 완벽히 녹여냈습니다.

---

## ✨ Key Features

### 1. 🚀 BYOD & 즉시 진입 (No Install, Zero Barrier)
- **별도 앱 설치 불필요**: 웹 표준 기술 기반으로 브라우저에서 즉시 실행.
- **QR/NFC 다이렉트 진입**: 테이블 태그 스캔 시 테이블 번호가 자동으로 인식되어 메뉴판(`/order/[storeId]?table=N`)으로 직행.
- **홈 화면 수동 선택 플로우**: 매장 선택 $\to$ 매장 식사(전용 테이블 선택) / 포장 선택 지원.
- **첫 방문 환영 온보딩 (`/setup`)**: 첫 접속 시 개인별 선호 접근성 옵션을 간편하게 설정할 수 있는 온보딩 가이드 제공.

### 2. ♿ 기본 내재화된 접근성 (Accessible by Default)
- **WCAG 2.2 AA / AAA 대비율**: 기본 테마 4.5:1 이상, 고대비 모드 7:1~21:1 보장.
- **최소 16px 텍스트 플로어**: 화면 어디에도 16px 미만의 작은 글자를 사용하지 않음.
- **44px~64px 넉넉한 터치 타깃**: 오터치 방지를 위한 대형 컨트롤.
- **시간 압박 제거**: 주문 시간제한 타이머나 자동 닫힘 팝업 없음.
- **완벽한 스크린 리더(VoiceOver / TalkBack) 지원**: 시맨틱 HTML, WAI-ARIA, 실시간 라이브 리전 안내(`LiveRegionAnnouncer`).

### 3. 🎨 토스 디자인 시스템 (TDS) 기반 UI
- **Toss Blue (`#0064FF`) 원 액센트**: 화이트 캔버스 위에 액션과 선택에만 절제된 블루 포인트 사용.
- **7단계 점진적 스쿼클 라운드**: 버튼, 카드, 바텀시트별 비례 라운드 스케일 (`--radius-xs` ~ `--radius-2xl`).
- **햅틱 & 모션 피드백**: 물리적 누름 질감을 재현하는 2단계 스프링 애니메이션 (`0.96` / `0.90`).
- **Pretendard Variable 로컬 서빙**: 외부 CDN 의존성 없는 빠른 폰트 렌더링 (`font-weight: 500` 바디 플로어).

### 4. 🧭 듀얼 주문 모드 (Standard vs Wizard)
- **표준 브라우징 모드**: 2열 풀블리드 실물 사진 카드 그리드 또는 1열 리스트 뷰, 실시간 카테고리 스크롤, 바텀시트 옵션 선택.
- **위저드 단계별 주문 모드 (`WizardOrderView`)**: 인지적 부담이 적은 4단계 순차 주문 플로우 (카테고리 $\to$ 메뉴 $\to$ 옵션 $\to$ 결제 요약). 고령자 및 집중 지원이 필요한 사용자를 위해 단일 화면에 하나의 결정만 제시.

### 5. 📱 한 손 모드 지원 (`OneHandedContainer`)
- 모바일 OS 키보드 스타일의 한 손 조작 레이아웃 (좌측 정렬 / 기본 / 우측 정렬).
- 화면 측면 플립 버튼 및 전체 화면 복원 버튼을 통해 엄지손가락이 닿는 최적의 조작 영역 제공.

### 6. 🔔 스마트 직원 호출 (Staff Call)
- 매장 식사 시 언제든 접근 가능한 플로팅 직원 호출 버튼.
- 물티슈, 앞치마, 앞접시, 영수증, 수저, 직원호출 등 6개 다빈도 요청 항목 멀티 선택 지원.
- 호출 즉시 동적 피드백 토스트 및 버튼 활성 상태 타이머 제공.

### 7. 🌐 완벽한 다국어 지원 (ko / en)
- 한국어 및 영어 지원 (6개 네임스페이스 JSON 딕셔너리 기반).
- 정적 타입 검사 및 100% 키 동기화 무결성 검사 (`bun run i18n:check`).
- 언어 변경 시 `document.documentElement.lang` 실시간 동기화로 스크린 리더 음성 엔진 자동 전환.

### 8. ⚡ 구형 모바일 최적화 (iOS 15 / iPhone 6s 지원)
- 저사양 기기에서의 부드러운 60fps 보장을 위해 카테고리 탭 인디케이터를 순수 CSS GPU 가속(`translate3d`)으로 최적화.
- 탭 좌표 및 섹션 오프셋 캐싱을 통해 레이아웃 스래싱(Layout Thrashing) 완전 제거.
- `window.requestIdleCallback`, `Object.hasOwn` 등 Safari 15 호환 폴리필(`lib/polyfills.ts`) 탑재.

---

## 🛠 Tech Stack

| 영역 | 기술 | 버전 / 상세 |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | `16.3.1` |
| **UI Library** | React | `19.2.8` |
| **Language** | TypeScript (strict mode) | `^5` |
| **Styling** | Tailwind CSS v4 (`@theme` tokens) | `^4` |
| **Primitives** | Radix UI Primitives + Vaul Drawer | `1.6.7` / `1.1.2` |
| **Icons** | Lucide React | `1.31.0` |
| **State** | Zustand (Cart, Accessibility, Payment, Toast) | `5.0.15` |
| **Animation** | Motion (`motion/react`) | `13.1.0` |
| **Smooth Scroll** | Lenis | `1.3.26` |
| **Korean NLP** | es-hangul (초성 검색, 조사 처리) | `2.4.0` |
| **Font** | Pretendard Variable (self-hosted .woff2) | `1.3.9` |
| **Test** | Vitest + React Testing Library + vitest-axe | `4.1.10` / `16.3.2` / `0.1.0` |
| **Package Manager** | Bun | `1.3.14` |

---

## 📂 Project Structure

```
jumun/
├── app/
│   ├── layout.tsx                # 루트 레이아웃 (<title> "JUMUN", 폰트, 테마 스크립트)
│   ├── page.tsx                  # 랜딩 페이지 (QR 스캔 CTA, 매장 선택 목록)
│   ├── providers.tsx             # 전역 클라이언트 프로바이더 (A11y, Toast 등)
│   ├── globals.css               # Tailwind CSS v4 @theme 토큰 정의
│   ├── order/
│   │   └── [storeId]/
│   │       ├── page.tsx          # 메뉴 브라우징 (QR 진입) 또는 매장식사/포장 선택
│   │       └── table/page.tsx    # 매장 식사 테이블 번호 선택 뷰
│   ├── settings/
│   │   ├── page.tsx              # 전용 설정 화면 (화면, 접근성, 결제, 언어, 주문내역)
│   │   └── payment/page.tsx      # 결제 수단 관리 화면
│   └── setup/
│       └── page.tsx              # 첫 방문 온보딩 및 접근성 설정 마법사
├── components/
│   ├── a11y/                     # LiveRegionAnnouncer, SkipLink, VisuallyHidden
│   ├── flow/                     # MenuClientView, WizardOrderView, ProductCard,
│   │                             # ProductDetailSheet, CartDrawer, CheckoutSheet,
│   │                             # StaffCallButton, OptionGroupList, SelectionCard 등
│   ├── layout/                   # HeaderBar, FlowHeader, OneHandedContainer
│   ├── settings/                 # FontScaleSelector, LanguageSelector, ThemeModeSelector 등
│   ├── shared/                   # StickyActionBar
│   └── ui/                       # button, drawer, card, switch, checkbox, RollingPrice 등
├── lib/
│   ├── data/                     # menu.json (상품 및 카테고리), stores.json (매장 데이터)
│   ├── i18n/                     # 다국어 엔진 (locales/ko, locales/en, useTranslation)
│   ├── services/                 # MenuService, OrderService, StoreService, A11yFeedbackService
│   ├── types/                    # cart, menu, store, order, toast, accessibility 타입
│   ├── format.ts                 # formatKRW, getCartTotals, getCartItemDisplayName
│   └── polyfills.ts              # iOS 15 / Safari 15 폴리필
├── store/                        # Zustand 스토어 (useCartStore, useAccessibilityStore,
│                                 # usePaymentStore, useToastStore)
└── tests/unit/                   # Vitest + RTL + vitest-axe 단위/컴포넌트 테스트 (12개 파일)
```

---

## 🚦 Getting Started

### 요구 사항
- [Bun](https://bun.sh/) 1.3+ 설치 권장 (또는 Node.js 20+ 및 npm)

### 설치 및 실행

```bash
# 의존성 패키지 설치
bun install

# 개발 서버 실행 (Turbopack)
bun run dev

# 프로덕션 빌드 (Next.js Turbopack)
bun run build

# 프로덕션 서버 실행
bun run start
```

### 테스트 및 검증

```bash
# 전체 단위 및 컴포넌트, 접근성(axe) 테스트 실행 (126개 테스트)
bun run test

# 다국어(i18n) 키 동기화 무결성 검증
bun run i18n:check

# ESLint 정적 분석 검사
bun run lint
```

---

## 🧪 Testing & Quality Assurance

JUMUN은 배리어프리 플랫폼으로서 높은 수준의 자동화 검증 체계를 운영합니다:

- **12개 테스트 파일, 126개 단위/컴포넌트 테스트 100% PASS**
- **@axe-core/react / vitest-axe 기반 WCAG 위반 0건 (Zero Violations)**
- **주요 테스트 영역**:
  - `tests/unit/components.test.tsx` (40 tests): 메뉴 카드, 상세 시트, 옵션 제약, 헤더바, 직원호출, OptionGroupList 등
  - `tests/unit/wizard.test.tsx` (10 tests): 위저드 4단계 주문 플로우, 한 손 조작 컨테이너 플립/확장 등
  - `tests/unit/setupFlow.test.tsx` (16 tests): 온보딩 플로우, SetupGuard, 라우트 복귀 처리
  - `tests/unit/settings.test.tsx` (12 tests): 설정 토글, 언어 전환, axe 접근성 검증
  - `tests/unit/i18n.test.ts` (11 tests): i18n 번역 엔진, 매개변수 치환, 언어 폴백
  - `tests/unit/useCartStore.test.ts` / `useAccessibilityStore.test.ts` / `useToastStore.test.ts`: 상태 관리 무결성
  - `tests/unit/A11yToastContainer.test.tsx`: 바텀 드로어 높이에 따른 동적 토스트 여백 및 포털 레이어링 검증
  - `tests/unit/OrderService.test.ts`: 주문 생성, 소계 계산, 결제 실패 시뮬레이션

---

## 📚 Documentation

| 문서 | 내용 요약 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | 시스템 아키텍처, 디렉토리 구조, 상태 모델, 구형 브라우저 호환성 |
| [docs/features.md](docs/features.md) | 화면별 사용자 여정 및 기능 명세 (표준 모드, 위저드 모드, 직원호출, 설정) |
| [docs/tech-stack.md](docs/tech-stack.md) | 도입 라이브러리 목록, 역할 분담, 모션 및 접근성 설계 원칙 |
| [docs/design-system.md](docs/design-system.md) | 토스 디자인 시스템(TDS) 토큰, 색상 대비율, 타이포그래피, 스쿼클 라운드 |
| [docs/i18n.md](docs/i18n.md) | 다국어(i18n) 아키텍처, 6개 네임스페이스 구조, 확장 가이드 |
| [docs/testing-strategy.md](docs/testing-strategy.md) | Vitest, RTL, vitest-axe 테스트 전략 및 스크린 리더 실기기 QA 지침 |
| [docs/project-status-and-roadmap.md](docs/project-status-and-roadmap.md) | 프로젝트 종합 현황, 구현 완료 내역 및 향후 로드맵 |
| [TODO.md](TODO.md) | 장바구니 TTL 만료, 주문 내역 관리 등 향후 고도화 태스크 |
| [CHANGELOG.md](CHANGELOG.md) | 버전별 변경 이력 기록 |

---

## 📄 License

Private & Proprietary. All rights reserved.
