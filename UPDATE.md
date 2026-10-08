# JUMUN (주문) — 프로젝트 종합 현황 및 로드맵 리포트

> **최종 업데이트 일자**: 2026년 10월 9일  
> **현재 진행 단계**: Phase 1 Web Prototype MVP (구현, 접근성 고도화, 구형기기 최적화 및 126개 테스트 검증 완료)

---

## 1. 프로젝트 개요 & 핵심 철학

**JUMUN (주문)**은 휠체어 이용자, 시각·저시력 장애인, 청각 장애인, 고령자, 난독증 사용자 등 **모든 사람이 타인의 도움 없이 자신의 스마트폰으로 주문과 결제를 완결할 수 있는 배리어프리(Barrier-Free) BYOD 셀프오더 플랫폼**입니다.

### 🌟 3대 핵심 원칙
1. **BYOD (Bring Your Own Device) 우선**: 접근하기 어렵고 조작이 불편한 매장 설치형 키오스크를 대체하여, 사용자가 이미 자신에게 맞게 설정해둔 스마트폰(스크린 리더, 글자 크기, 고대비 등)으로 QR/NFC를 태그해 즉시 진입합니다.
2. **Accessible by Default (기본으로 내재화된 접근성)**: 별도의 "장애인 전용 모드"나 "간편 모드"로 분리하지 않고, 세련된 토스 스타일의 단일 인터페이스 안에 WCAG 2.2 AA/AAA 기준(4.5:1~21:1 고대비, 44px+ 터치 타깃, 16px 텍스트 하한선, 포커스 링, 시간제한 제거)을 완벽하게 녹여냅니다.
3. **Cross-Venue Settings Carryover (영구 지속 개인화)**: 한 매장에서 설정한 글자 크기, 테마, 모션 줄이기, 햅틱, 난독증 간격, 한 손 모드, 위저드 주문 모드 설정은 디바이스 스토리지에 보존되어 전국의 어떤 JUMUN 제휴 매장을 방문해도 재설정 없이 즉시 적용됩니다.

---

## 2. 지금까지 완수한 작업 내역 (Accomplishments)

### 📌 1) 기반 아키텍처 & 디자인 시스템 구축
- **Next.js 16.3.1 (App Router, Turbopack) + React 19.2.8 + TypeScript**: 초고속 Turbopack 빌드 및 React 19 최신 훅 규칙 완벽 준수.
- **Tailwind CSS v4 `@theme` 토큰 시스템**: Figma 및 토스 브랜드 가이드를 정밀 분석한 TDS(Toss Design System) 토큰 레이어 구현 (`#0064FF` Toss Blue, 순수 화이트 배경, 보더+그림자 융합 규칙).
- **7단계 점진적 스쿼클 라운드 스케일 (`--radius-xs` ~ `--radius-2xl`)**: 버튼, 카드, 시트별 비례 라운드 적용 (ADR 0011).
- **폰트 자체 호스팅**: `Pretendard Variable` 폰트를 로컬 서빙하여 렌더링 블로킹 및 CDN 지연 제거 (`font-weight: 500` 바디 플로어 적용).
- **Motion 단일 모션 레이어 통합 (ADR 0009, 0010)**: GSAP 의존성을 제거하고 Motion(`motion/react`)으로 일원화, 2단계 햅틱/터치 스프링 피드백(`0.96` / `0.90`) 및 `reduceMotion` 완벽 제어.
- **구형 브라우저 (iOS 15 / Safari 15 / iPhone 6s) 호환성 폴리필**: `window.requestIdleCallback`, `window.cancelIdleCallback`, `Object.hasOwn` 폴리필(`lib/polyfills.ts`) 탑재로 런타임 크래시 방지.

### 📌 2) 사용자 여정 및 UI/UX 혁신
- **실물 메뉴 사진 & 2열 풀블리드 카드 그리드 / 1열 리스트 전환 (ADR 0013, 0012)**:
  - 30여 종의 실제 고화질 메뉴 사진 자산 도입 (`/public/images/menu/*.jpg`).
  - 사진 전체를 채우는 풀블리드 카드와 반투명 리퀴드 글래스 인포 패널 (`backdrop-blur-sm`).
  - 사용자의 시각적 선호에 맞춰 그리드 뷰와 리스트 뷰를 자유롭게 전환 가능.
- **진입 플로우 & 매장 식사/포장 분기 분리 (ADR 0014)**:
  - QR/NFC 스캔 시 테이블 번호가 즉시 인식되어 메뉴판으로 직행 (`/order/[storeId]?table=N`).
  - 홈 화면 "직접 매장 선택하기" 진입 시 매장 식사 vs 포장 선택 단계 (`OrderTypeSelectView`) 제공.
  - 매장 식사 선택 시 전용 테이블 번호 선택 뷰 (`TableSelectView`)를 거쳐 메뉴로 진입.
- **첫 방문 온보딩 마법사 (`/setup` & `SetupGuard`)**:
  - 첫 방문 시 사용자의 접근성 선호(글자 크기, 테마, 모션 등)를 사전 세팅할 수 있는 부드러운 온보딩 단계 제공.
- **위저드 단계별 주문 모드 (`WizardOrderView`)**:
  - 인지적 부담이나 정보 과부하를 겪는 사용자를 위한 4단계 순차 주문 모드 (1단계 카테고리 $\to$ 2단계 메뉴 $\to$ 3단계 옵션 $\to$ 4단계 결제).
  - 한 번에 하나의 결정에만 집중할 수 있는 깔끔한 1열 카드 인터페이스.
- **한 손 조작 모드 (`OneHandedContainer`)**:
  - 대화면 스마트폰에서도 엄지손가락이 닿을 수 있도록 화면을 좌측 또는 우측으로 좁혀주는 OS 키보드 스타일 레이아웃.
  - 측면 플립 버튼으로 즉시 방향 전환 및 전체 화면 확장 지원.
- **직원 호출(Staff Call) 6대 옵션 스마트 드로어**:
  - 매장 식사 시 플로팅 액션 버튼으로 즉시 접근.
  - 물티슈, 앞치마, 앞접시, 영수증, 수저, 직원호출 6가지 다빈도 요청 항목 멀티 선택.
  - 호출 확인 즉시 동적 안내 토스트 및 버튼 활성 상태 체크 타이머(3.5초) 동작.
- **통합 옵션 그룹 컴포넌트 (`OptionGroupList`)**:
  - 일반 상품 상세 시트(`ProductDetailSheet`)와 위저드 주문 모드(`WizardOrderView`) 간 중복 옵션 렌더링 로직을 단일 컴포넌트로 통합.
  - 단일 선택 소형 그룹은 2열 세그먼트 칩, 다중/대형 그룹은 체크박스 행으로 반응형 렌더링.
- **전용 설정 페이지 (`/settings`) & 결제 관리 (`/settings/payment`)**:
  - 드로어 팝업을 전용 라우트로 깔끔히 통합.
  - 100%~150% 글자 크기 인터랙티브 슬라이더 및 실시간 프리뷰 카드.
  - 네이티브 OS 드롭다운 기반 언어 선택기 (`LanguageSelector`).
  - 최근 주문 내역 영수증 요약 카드 제공.
- **다국어(i18n) 시스템 (한국어 / English)**:
  - 6개 도메인별 네임스페이스(`common`, `landing`, `menu`, `orderFlow`, `settings`, `setup`).
  - 100% 키 동기화 무결성 CLI (`bun run i18n:check`).
  - 스크린 리더 음성 엔진과 실시간 연동되는 HTML `lang` 동기화.
- **구형 모바일 60fps 최적화 (성능 하드닝)**:
  - 카테고리 탭 인디케이터를 순수 CSS GPU 가속(`translate3d`)으로 전환하여 프레임 드랍 제거.
  - 탭 좌표 및 카테고리 섹션 오프셋 사전 캐싱으로 스크롤 중 레이아웃 스래싱(Layout Thrashing) 완전 차단.
  - `[contain:layout]` 격리로 리플로우 범위 국소화.

### 📌 3) 테스트 및 품질 검증
- **Vitest + React Testing Library + axe-core**:
  - `tests/unit/components.test.tsx` (40 tests): 메뉴 카드, 상세 시트, 옵션 제약, 헤더바, 직원호출 등
  - `tests/unit/wizard.test.tsx` (10 tests): 위저드 4단계 플로우, 한 손 조작 컨테이너 플립/확장 등
  - `tests/unit/setupFlow.test.tsx` (16 tests): 온보딩 플로우, SetupGuard, 라우트 복귀 처리
  - `tests/unit/settings.test.tsx` (12 tests): 설정 토글, 언어 전환, axe 접근성 검증
  - `tests/unit/i18n.test.ts` (11 tests): i18n 엔진, 매개변수 치환, 언어 폴백
  - `tests/unit/OrderService.test.ts` (6 tests): 주문 생성, 소계 계산, 결제 실패 시뮬레이션
  - `tests/unit/theme.test.tsx` (7 tests): 테마 스토어, 다크/라이트/고대비 모드
  - `tests/unit/useCartStore.test.ts` (6 tests): 장바구니 수량 계산, 실행 취소 스택
  - `tests/unit/useToastStore.test.ts` (7 tests): 토스트 큐 및 타이머
  - `tests/unit/useAccessibilityStore.test.ts` (6 tests): 접근성 프리셋 및 리셋
  - `tests/unit/A11yToastContainer.test.tsx` (3 tests): 바텀시트 여백 및 포털 레이어링
  - `tests/unit/foundation.test.tsx` (2 tests): 디자인 시스템 및 폰트 토큰
  - **총 12개 테스트 스위트, 126개 테스트 100% PASS (axe 접근성 위반 0건)**.

---

## 3. 현재 시스템 아키텍처 및 화면 현황 (Current State)

```
[사용자 진입 경로]
  ├─ QR / NFC 태그 스캔 ────→ /order/[storeId]?table={n} ──→ [메뉴 탐색 (MenuClientView)]
  │                                                                 │
  │                                                                 ├─ 표준 모드 (그리드/리스트)
  │                                                                 └─ 위저드 모드 (4단계 순차)
  │
  ├─ 홈 화면 수동 매장 선택 ──→ /order/[storeId] (선택 화면)
  │                             ├─ 포장 선택 ──────────────→ /order/[storeId]?type=takeout ──┘
  │                             └─ 매장 식사 선택 ──────────→ /order/[storeId]/table (테이블 선택) ──┘
  │
  └─ 첫 방문 미설정 사용자 ──→ /setup (접근성 온보딩 마법사) ────→ 이전 목적지로 복귀

[메뉴 탐색 및 주문 흐름]
  [메뉴 브라우징] ──(상품 탭)──→ [상품 상세 시트] ──(담기)──→ [장바구니 플로팅 알약]
         │                              │                               │
         │                              ▼                               ▼
         │                     [OptionGroupList]               [장바구니 드로어]
         │                                                              │
         │                                                              ▼
         │                                                     [결제 확인 드로어]
         │                                                              │
         ▼                                                              ▼
  [직원 호출 6옵션 드로어]                                      [주문 완료 영수증 화면]
  [전용 설정 페이지 (/settings)]                                 (새로운 주문하기 ──→ 초기화)
  [한 손 조작 모드 (좌/우 패널)]
```

---

## 4. 앞으로의 로드맵 (Roadmap)

### 🚀 Phase 1: Web Prototype MVP (현재 단계 — 완료 및 검증 완료)
- [x] 배리어프리 접근성 기본값 웹 애플리케이션 구축
- [x] 토스 디자인 시스템(TDS) 시각 언어 및 토큰 일원화
- [x] 위저드 주문 모드 & 한 손 조작 모드
- [x] 다국어(ko/en) 6개 네임스페이스 엔진 구축
- [x] 구형 브라우저(iOS 15 / Safari 15) 호환성 및 GPU 최적화
- [x] 126개 단위/컴포넌트/axe 테스트 100% 통과

### 🛒 Phase 2: Cart TTL & Order History 고도화 (차기 마일스톤, 상세 내역 TODO.md 참조)
- [ ] 장바구니 영속화 및 30분~1시간 만료(TTL) 자동 관리 (`useCartStore`)
- [ ] 설정 페이지 상단 주문 내역 카드 및 최근 주문 번호 로컬 영구 보존 (`localStorage`)
- [ ] 다중 탭 동기화(`storage` 이벤트) 및 결제 시 중복 방지(`idempotencyKey`)
- [ ] 실시간 주문 진행 상태 트래커 (접수 대기 $\to$ 조리 중 $\to$ 픽업 완료)

### 📲 Phase 3: Native Port (Expo / React Native Monorepo)
- [ ] Expo Router 기반 크로스 플랫폼 네이티브 앱 구조화
- [ ] Zustand 스토어 및 `lib/services/*` 비즈니스 로직 100% 재사용
- [ ] 네이티브 햅틱스(`expo-haptics`) 및 네이티브 NFC 리더 바인딩
