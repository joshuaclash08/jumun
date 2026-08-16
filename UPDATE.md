# Jumun (주문) — 프로젝트 종합 현황 및 로드맵 리포트

> **최종 업데이트 일자**: 2026년 8월 17일  
> **현재 진행 단계**: Phase 1 Web Prototype MVP (구현 및 검증 완료)

---

## 1. 프로젝트 개요 & 핵심 철학

**Jumun (주문)**은 휠체어 이용자, 시각·저시력 장애인, 청각 장애인, 고령자, 난독증 사용자 등 **모든 사람이 타인의 도움 없이 자신의 스마트폰으로 주문과 결제를 완결할 수 있는 배리어프리(Barrier-Free) BYOD 셀프오더 플랫폼**입니다.

### 🌟 3대 핵심 원칙
1. **BYOD (Bring Your Own Device) 우선**: 접근하기 어렵고 조작이 불편한 매장 설치형 키오스크를 대체하여, 사용자가 이미 자신에게 맞게 설정해둔 스마트폰(스크린리더, 글자 크기 등)으로 QR/NFC를 태그해 즉시 진입합니다.
2. **Accessible by Default (기본으로 내재화된 접근성)**: 별도의 "장애인 전용 모드"나 "간편 모드"로 분리하지 않고, 세련된 토스 스타일의 단일 인터페이스 안에 WCAG 2.2 AA/AAA 기준(4.5:1~21:1 고대비, 44px+ 터치 타깃, 16px 텍스트 하한선, 포커스 링, 시간제한 제거)을 완벽하게 녹여냅니다.
3. **Cross-Venue Settings Carryover (영구 지속 개인화)**: 한 매장에서 설정한 고대비, 글자 크기, 리듀스모션, 햅틱, 난독증 간격 설정은 디바이스에 영구 저장되어 전국의 어떤 Jumun 제휴 매장을 방문해도 재설정 없이 즉시 적용됩니다.

---

## 2. 지금까지 완수한 작업 내역 (Accomplishments)

### 📌 1) 기반 아키텍처 & 디자인 시스템 구축
- **Next.js 16 (App Router) + React 19 + TypeScript**: 최신 Next.js 기반 반응형 모바일 뷰포트 아키텍처 수립.
- **Tailwind CSS v4 `@theme` 토큰 시스템**: Figma 및 토스 브랜드 가이드를 정밀 분석한 TDS(Toss Design System) 토큰 레이어 구현 (`#0064FF` Toss Blue, 순수 화이트 배경, 보더+그림자 융합 규칙).
- **7단계 점진적 스쿼클 라운드 스케일 (`--radius-xs` ~ `--radius-2xl`)**: 버튼, 카드, 시트별 비례 라운드 적용 (ADR 0011).
- **폰트 자체 호스팅**: `Pretendard Variable` 폰트를 로컬 서빙하여 렌더링 블로킹 및 CDN 지연 제거 (`font-weight: 500` 바디 플로어 적용).
- **Motion 단일 모션 레이어 통합 (ADR 0009, 0010)**: GSAP 의존성을 제거하고 Motion(`motion/react`)으로 일원화, 2단계 햅틱/터치 스프링 피드백(`0.96` / `0.90`) 및 `reduceMotion` 완벽 제어.

### 📌 2) 사용자 여정 및 UI/UX 혁신
- **실물 메뉴 사진 & 2열 풀블리드 카드 그리드 (ADR 0013, 0012)**:
  - 30여 종의 실제 고화질 메뉴 사진 자산 도입 (`/public/images/menu/*.jpg`).
  - 사진 전체를 채우는 풀블리드 카드와 반투명 리퀴드 글래스 인포 패널 (`backdrop-blur-sm` + 상단 그라데이션 페이드 마스크).
  - 메뉴명 길이에 따라 카드 높이가 자연스럽게 늘어나는 가변 수직 확장 구조.
- **진입 플로우 & 매장 식사/포장 분기 분리 (ADR 0014)**:
  - QR/NFC 스캔 시 테이블 번호가 즉시 인식되어 메뉴판으로 직행 (`/order/[storeId]?table=N`).
  - 홈 화면 "직접 매장 선택하기" 진입 시 매장 식사 vs 포장 선택 단계 (`OrderTypeSelectView`) 제공.
  - 매장 식사 선택 시 전용 테이블 번호 선택 뷰 (`TableSelectView`)를 거쳐 메뉴로 진입하며, 결제 단계에서 식사 장소를 중복 질문하지 않음.
- **전용 설정 페이지 (`/settings`) & 체크박스 시스템 (ADR 0007)**:
  - 번잡했던 7개 섹션 드로어 팝업을 독립 라우트 (`/settings`, `/settings/accessibility`, `/settings/payment`)로 분리.
  - 장식용 아이콘을 덜어내고 텍스트 가독성에 집중한 깔끔한 UI로 전면 개편.
  - 신규 Radix 기반 `Checkbox` 컴포넌트를 구축하여 한 손 터치 및 행 단위 선택(`htmlFor`, `onClick`) 편의성 극대화.
- **직원 호출(Staff Call) 2단계 바텀 드로어**:
  - 메뉴 최하단에 매몰되어 있던 호출 버튼을 매장 식사 주문 시 플로팅 액션 및 헤더로 전진 배치.
  - 호출 확인(Idle) $\to$ 호출 완료 및 애니메이션 체크마크(Success)로 이어지는 매끄러운 2단계 드로어 UX 구축.
- **메뉴 상세(ProductDetailSheet) 클린업**:
  - 대표 사진 좌측 상단에 40px 원형 뒤로가기 버튼 오버레이.
  - 옵션 타이틀 바로 옆 "필수" 배지 부착 및 불필요한 보조 문구("(1개 선택)", "추가금 없음") 완전 제거.
  - 옵션 최대 선택 수량 제한(`maxSelections`) 초과 시 직관적인 토스트 알림 안내.
  - 하단 프로그레시브 블러 페이드 마스크 액션 바 + `RollingPrice` 실시간 금액 롤링 애니메이션.
- **주문 완료(ConfirmationStep) 시각적 임팩트**:
  - 한눈에 확인 가능한 대형 주문번호 히어로 타이포그래피 (4xl/5xl).
  - 상세 영수증 카드(주문 내역, 옵션 요약, 주문 일시, 총 금액).
  - 스티키 "새로운 주문하기" 버튼으로 장바구니 및 주문 세션 완벽 리셋.
- **드로어-Lenis 스크롤 충돌 격리**:
  - 드로어 오버레이 및 콘텐츠에 `overscroll-contain`, `data-lenis-prevent=""`를 적용하여 팝업 내부 스크롤 시 부모 페이지 스크롤 간섭 문제 완벽 차단.

### 📌 3) 테스트 및 품질 검증
- **Vitest + React Testing Library + axe-core**:
  - `tests/unit/useCartStore.test.ts` (장바구니 수량 계산, 히스토리 스택, 실행 취소)
  - `tests/unit/useAccessibilityStore.test.ts` (접근성 프리셋 및 리셋)
  - `tests/unit/OrderService.test.ts` (주문 성공/실패 시뮬레이션)
  - `tests/unit/settings.test.tsx` (체크박스 토글, 텍스트 렌더링, axe 접근성 위반 제로 검증)
  - `tests/unit/components.test.tsx` (헤더바 내비게이션, 직원호출 2단계 플로우, 상품상세 옵션 제한, 주문유형/테이블 선택)
  - **총 6개 테스트 스위트, 32개 테스트 100% PASS 달성**.

---

## 3. 현재 시스템 아키텍처 및 화면 현황 (Current State)

```
[사용자 진입 경로]
  ├─ QR / NFC 태그 스캔 ────→ /order/[storeId]?table={n} ──→ [메뉴 탐색 (MenuClientView)]
  └─ 홈 화면 수동 매장 선택 ──→ /order/[storeId] (선택 화면)
                                ├─ 포장 선택 ──────────────→ /order/[storeId]?type=takeout ──┘
                                └─ 매장 식사 선택 ──────────→ /order/[storeId]/table (테이블 선택) ──┘

[메뉴 탐색 및 주문 흐름]
  [메뉴 브라우징] ──(상품 탭)──→ [상품 상세 드로어] ──(담기)──→ [장바구니 플로팅 알약]
         │                                                              │
         │                                                              ▼
         │                                                     [장바구니 드로어]
         │                                                              │
         │                                                              ▼
         │                                                     [결제 확인 드로어]
         │                                                              │
         ▼                                                              ▼
  [직원 호출 2단계 드로어]                                      [주문 완료 영수증 화면]
  [전용 설정 페이지 (/settings)]                                 (새로운 주문하기 ──→ 초기화)
```

### 📂 주요 디렉토리 및 파일 현황
- `app/`: Next.js App Router 기반 라우팅 (`/`, `/order/[storeId]`, `/order/[storeId]/table`, `/settings/*`)
- `components/flow/`: 위저드 플로우 핵심 컴포넌트 (`MenuClientView`, `ProductCard`, `ProductDetailSheet`, `CartDrawer`, `CheckoutSheet`, `ConfirmationStep`, `StaffCallButton`, `FeaturedMenuSection`, `OrderTypeSelectView`, `TableSelectView`, `QrScannerModal`)
- `components/layout/`: `HeaderBar` (3열 그리드 뒤로가기 내비게이션 및 매장/테이블 배지)
- `components/settings/`: `SettingsHeader`, `SettingsRow` (텍스트 중심의 리스트 행)
- `components/ui/`: shadcn + Radix 기반 기본 프리미티브 (`button`, `drawer`, `card`, `checkbox`, `switch`, `badge`, `RollingPrice`, `TossIllustrations`)
- `lib/services/`: `MenuService`, `OrderService`, `StoreService`, `AccessibilityService`, `A11yFeedbackService`
- `lib/data/`: `menu.json` (9개 카테고리, 19개 상품, 실물 이미지 매핑), `stores.json` (매장 목록 및 테이블 수)
- `store/`: `useCartStore.ts`, `useAccessibilityStore.ts`, `usePaymentStore.ts`

---

## 4. 앞으로 해야 할 작업 & 로드맵 (Roadmap)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Web Prototype MVP (완료 및 폴리싱 완료)                        │
└───────────────────┬────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Native Port (Expo / React Native Monorepo 구축)               │
│ - iOS/Android 네이티브 햅틱(Taptic Engine) & 백그라운드 NFC 지원         │
└───────────────────┬────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: 음성 주문 인터페이스 (STT/TTS Voice Scope)                     │
│ - Whisper / Web Speech API 기반 대화형 주문 및 스크린리더 공존 음성 안내│
└───────────────────┬────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: 실결제(PG) 및 실시간 매장 POS/KDS 백엔드 연동                 │
│ - 토스페이/애플페이/카드 결제, WebSocket 기반 조리 상태 실시간 알림     │
└───────────────────┬────────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: 다국어(i18n) 및 글로벌/타 버티컬 확장                         │
│ - 영어/일본어/중국어 다국어 팩, 영화관/공항/공공 키오스크 BYOD 확장     │
└────────────────────────────────────────────────────────────────────────┘
```

### 🚀 세부 추진 과제

#### 1. Phase 1 잔여 고도화 및 운영 준비 (Short-term)
1. **원터치 접근성 프리셋 UI 연동**:
   - `useAccessibilityStore`에 이미 구현된 `applyPreset("visual" | "hearing" | "reading" | "senior")` 액션을 설정 상단에 퀵 프리셋 카드로 노출.
2. **실시간 조리 진행 상태 시뮬레이션**:
   - 주문 완료 후 단순 영수증 화면을 넘어 `주문 접수` $\to$ `메뉴 준비 중` $\to$ `픽업 요청`으로 이어지는 실시간 진행 상태 Mocking/알림 바인딩.
3. **PWA 오프라인 캐싱 및 Service Worker 강화**:
   - 불안정한 매장 Wi-Fi/LTE 환경에서도 메뉴 목록과 기본 자산이 즉시 로딩되도록 Cache Storage 전략 구성.

#### 2. Phase 2: Expo / React Native 크로스플랫폼 포팅 (Medium-term)
1. **Expo Monorepo 구성 (`react-native-web` 병행)**:
   - 웹 환경을 단절하지 않고 동일한 비즈니스 로직(Zustand 스토어, Services, Types)을 공유하는 모노레포 구축.
2. **하드웨어 제약 극복**:
   - iOS Web에서 지원되지 않는 진동 피드백을 `expo-haptics`를 통해 완벽 구현.
   - 앱 미실행 상태에서도 태그 접근 시 즉시 반응하는 백그라운드 NFC 태그 인텐트 처리.
3. **iOS App Clip & Android Instant App 배포**:
   - 앱 전체를 설치하지 않고도 10MB 이하의 초경량 인스턴트 앱으로 네이티브 성능 제공.

#### 3. Phase 3: AI 기반 음성 주문 (Voice Ordering Interface)
1. **STT (Speech-to-Text) 대화형 장바구니**:
   - "따뜻한 아메리카노 한 잔이랑 치즈케이크 담아줘"와 같은 자연어 명령을 형태소 및 메뉴 카탈로그와 매핑하여 자동 옵션 선택/담기.
2. **VoiceOver / TalkBack 공존 설계**:
   - OS 스크린리더가 켜져 있을 때 자체 음성(TTS)과 중복 낭독되지 않도록 똑똑한 음성 채널 조율(Audio Ducking 및 음성 제어 토글).

#### 4. Phase 4: 실결제 모듈 및 점주용 POS/KDS 백엔드 연동
1. **실제 결제 게이트웨이(PG) 연동**:
   - 토스페이먼츠(Toss Payments), 카카오페이, Apple Pay, 신용카드 결제창 연동.
2. **주문 접수 및 주방 디스플레이 시스템 (KDS)**:
   - 주문이 발생했을 때 매장 주방 태블릿으로 실시간 전달되는 WebSocket/SSE 기반 백엔드 API 서버 구축.

---

## 5. 결론 및 요약

Jumun 프로젝트는 **기획, 아키텍처 수립, 디자인 토큰 정렬, 풀블리드 사진 기반 메뉴 인터페이스, 주문 및 설정 여정, 스크롤 안정화 및 자동화 테스트**에 이르기까지 **Phase 1 웹 프로토타입의 모든 요구사항을 최고 수준의 완성도(High Fidelity)로 달성**했습니다.

모든 기능과 디자인 표준은 문서(`docs/`, `DESIGN.md`, `CHANGELOG.md`)와 100% 동기화되어 있으며, 다음 단계인 Phase 2 네이티브 확장 및 실결제/백엔드 연동을 즉시 진행할 수 있는 견고한 토대를 확보하였습니다.
