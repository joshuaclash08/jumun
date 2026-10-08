# JUMUN (주문) — 미정리 항목 전수 감사 및 개선 완료 리포트

> **문서 버전**: v1.1.0  
> **감사 및 완료 일자**: 2026년 10월 9일  
> **프로젝트 상태**: Phase 1 Web Prototype MVP — 전수 감사, 문서 개편, 코드 모듈 분리 및 126개 테스트 100% 검증 완료  

---

## 1. 전수 감사(Audit) 배경 및 개요

본 감사는 사용자 지시사항에 따라 저장소 전반의 **미정리 항목(Unorganized Items)**, **부정확·노후화된 문서(Stale Documentation)**, **모놀리식·중복 코드 구조(Messy / Monolithic Code)**를 식별하고, 브라우저 탭 타이틀 단일화 및 프로덕션 품질 무결성을 확보하기 위해 진행되었습니다.

### 📋 감사 및 개선 핵심 목표
1. **미정리 항목 전수 리스트업 및 현황 보고**: 마크다운 문서 및 코드베이스 내 방치·중복·괴리 항목 전수 감사.
2. **브라우저 탭 및 메타데이터 단일화**: 브라우저 탭 제목을 불필요한 수식어 없이 순수 `"JUMUN"`으로 단일화 및 PWA 메타데이터 동기화.
3. **문서(Documentation) 전면 최신화 및 정합성 교정**:
   - `PRODUCT.md` 및 `plan.md` 내 "실물 메뉴 사진 없음", "음성 안내(TTS) 범위 제외" 등 현재 구현과 정면 충돌하는 묵은 허위 정보 교정.
   - 2026년 8월 과거 계획 문서 4종에 `[HISTORICAL ARCHIVE]` 명시.
   - 위저드 주문 모드(ADR 0015) 및 구형 기기 폴리필·GPU 전환(ADR 0016) 신규 ADR 작성.
   - `docs/project-status-and-roadmap.md`와 바이트 단위 100% 복제 상태였던 `UPDATE.md`를 고유한 전수 감사 리포트로 전면 개편.
4. **코드 분리, 통합 및 정돈 (Decomposition & Cleanup)**:
   - ~800줄 모놀리식 `WizardOrderView.tsx`를 4개 독립 스텝 컴포넌트로 분리 (`components/flow/wizard/`).
   - 중복 구현된 결제 선택 마크업을 `SelectionCard`로 일원화.
   - `components/settings/index.ts` 배럴 누락 export(`SegmentedControl`) 보완.
   - `app/settings/page.tsx` 중복 네비게이션 핸들러 통합.
   - `HeaderBar.tsx`, `TableSelectView.tsx`의 불필요한 포커스 링 오버라이드 제거(글로벌 TDS 아웃라인 상속).
5. **테스트 및 빌드 무결성 보증**:
   - Vitest 12개 스위트, 126개 테스트 100% 통과 유지 및 React 19 `act(...)` 경고 스팸 제거.
   - Turbopack 프로덕션 빌드(500ms대) 및 ESLint(0 warning) 유지.
   - i18n 6개 네임스페이스 키 일치율 100% 검증.

---

## 2. 식별된 미정리 항목 및 조치 내역 (Audit Findings & Resolutions)

### 📌 [Finding 1] 브라우저 탭 타이틀 및 PWA 매니페스트 불일치
- **발견 증상**:
  - 브라우저 탭 타이틀에 긴 부제나 템플릿이 노출될 우려 및 `public/manifest.json`의 한글 오타(`"바리어프리"`).
- **원인 분석**:
  - `public/manifest.json` 내 `name`이 `"Jumun — 바리어프리 셀프오더"`, `short_name`이 `"Jumun"`으로 설정되어 대소문자 및 오타 불일치 발생.
- **해결 조치**:
  - `app/layout.tsx`: `title: "JUMUN"`으로 단일화하여 브라우저 탭에 순수 `"JUMUN"`만 노출되도록 보장.
  - `public/manifest.json`: `"name": "JUMUN — 배리어프리 셀프오더"`, `"short_name": "JUMUN"`으로 정렬 및 오타 교정.

---

### 📌 [Finding 2] 문서 내 치명적 불일치 (Stale & Contradictory Documentation)
- **발견 증상**:
  - `PRODUCT.md`와 `plan.md`에서 "실물 메뉴 사진 없음 (flat illustration만 허용)", "음성 안내(TTS)는 Phase 1 범위 밖"이라고 기술되어 있었으나, 실제 저장소에는 29개의 실물 메뉴 사진(`public/images/menu/*.jpg`)과 Web Speech API 기반 음성 가이드(`hooks/useVoiceGuide.ts`)가 활발히 사용되고 있었음.
  - `docs/HANDOFF-2026-08-17.md`, `docs/ux-plan-2026-08-17.md` 등 2026년 8월 문서에 적힌 테스트 개수(33개)와 시스템 상태가 현재(126개)와 달라 독자에게 혼란을 초래함.
  - `UPDATE.md`가 `docs/project-status-and-roadmap.md`와 바이트 단위로 100% 동일한 복제본이었음.
- **해결 조치**:
  - `PRODUCT.md`: Capabilities 및 Evidence 섹션을 최신화하여 29개 실물 사진 자산(ADR 0013)과 Web Speech API 클라이언트 사이드 TTS(`hooks/useVoiceGuide.ts`) 구현을 공식 반영 (STT 음성 인식 주문만 Phase 2+로 유지).
  - `plan.md`: Current status 및 Phase 1 Scope에 위저드 주문 모드(ADR 0015), 한 손 모드, 실물 사진, 음성 안내를 명시.
  - 8월 문서 4종(`docs/HANDOFF-2026-08-17.md`, `docs/ux-plan-2026-08-17.md`, `docs/ux-planning-2026-08.md`, `docs/ux-audit.md`): `[HISTORICAL ARCHIVE]` 콜아웃을 상단에 추가하여 2026년 10월 최신 스펙 문서로 안내.
  - ADR 0015 및 ADR 0016 작성:
    - `docs/decisions/0015-wizard-and-one-handed-modes.md`: 위저드 4단계 순차 주문 및 OS 키보드형 한 손 조작 모드 아키텍처 기록.
    - `docs/decisions/0016-ios15-polyfills-and-tab-gpu-transitions.md`: iOS 15 Safari 런타임 폴리필(`lib/polyfills.ts`) 및 탭 트랜지션 GPU 가속화 기록.
  - `UPDATE.md`: 복제본을 삭제하고 본 전수 감사 및 개선 완료 리포트로 전면 탈바꿈.
  - `CHANGELOG.md`: 누락되었던 최근 작업(iOS 15 폴리필, 탭 타이틀 JUMUN, 위저드 서브컴포넌트 분리 등) 항목 추가.

---

### 📌 [Finding 3] 모놀리식 컴포넌트 및 중복 코드 (Monolithic & Redundant Code)
- **발견 증상**:
  - `components/flow/WizardOrderView.tsx`가 단일 파일 내 ~800줄에 달하며 4단계 렌더링 로직, 상태 관리, 결제 라디오 버튼 마크업이 한곳에 얽혀 유지보수가 극히 어려웠음.
  - `components/settings/index.ts`에서 핵심 컴포넌트인 `SegmentedControl`이 export되지 않아 외부에서 배럴 임포트가 불가능했음.
  - `app/settings/page.tsx`에 `handleBack`과 `handleComplete` 함수가 동일한 로직을 별도로 중복 선언하고 있었음.
  - `components/layout/HeaderBar.tsx` 및 `components/flow/TableSelectView.tsx`에 `focus-visible:ring-2 focus-visible:ring-ring` 스타일이 하드코딩되어 글로벌 포커스 링 스펙(`DESIGN.md` 토스 블루 2px 아웃라인)과 충돌하고 불필요한 번들을 발생시킴.
- **해결 조치**:
  - **위저드 서브컴포넌트 분리 (`components/flow/wizard/`)**:
    - `WizardCategoryStep.tsx`: 카테고리 선택 및 품목 수 안내.
    - `WizardProductStep.tsx`: 카테고리별 상품 선택 및 뒤로가기.
    - `WizardOptionStep.tsx`: `OptionGroupList` 및 `QuantityStepper`를 활용한 옵션 구성.
    - `WizardCheckoutStep.tsx`: 주문 내역 요약 및 `SelectionCard`를 재사용한 결제 수단 선택.
    - `index.ts`: 배럴 익스포트 제공.
  - **`WizardOrderView.tsx` 오케스트레이터 슬림화**: 800줄에서 ~480줄로 40% 이상 압축, `step === 3` 진입 시 `selectedProduct`가 null인 경우 안전하게 1단계로 복귀하는 방어 로직 추가.
  - **결제 UI 통합**: `WizardCheckoutStep` 내 결제 수단 선택 UI를 `SelectionCard` 컴포넌트로 일원화하여 일관된 햅틱/터치 애니메이션 및 ARIA `role="radio"` 지원.
  - **배럴 및 네비게이션 정리**: `components/settings/index.ts`에 `export * from "./SegmentedControl";` 추가, `app/settings/page.tsx` 내 핸들러 `const handleComplete = handleBack;`로 통합.
  - **포커스 링 정리**: `HeaderBar.tsx`와 `TableSelectView.tsx`의 불필요한 `focus-visible:ring-2` 클래스를 제거하여 통일된 글로벌 포커스 링 상속.

---

### 📌 [Finding 4] 테스트 러너 경고 스팸 (React 19 `act(...)` Warnings)
- **발견 증상**:
  - `bun run test` 실행 시 `tests/unit/wizard.test.tsx`에서 `useAccessibilityStore.getState().setOneHandedMode(...)` 호출 시 "An update to OneHandedContainer inside a test was not wrapped in act(...)" 경고가 대량 출력됨.
- **해결 조치**:
  - `tests/unit/wizard.test.tsx` 내 상태 변경 및 클릭 이벤트를 `act(() => { ... })`로 감싸 경고를 완전히 박멸 (126개 테스트 경고 0건 클린 패스).

---

## 3. 파일별 변경 요약 (Change Inventory)

| 구분 | 파일 경로 | 변경 요약 |
|---|---|---|
| **메타데이터** | `app/layout.tsx` | 브라우저 탭 타이틀을 간결한 `"JUMUN"`으로 단일화 |
| **메타데이터** | `public/manifest.json` | `"name"`, `"short_name"`을 `"JUMUN"`으로 정렬 및 `"배리어프리"` 오타 수정 |
| **코드 분리** | `components/flow/wizard/WizardCategoryStep.tsx` | 위저드 1단계 (카테고리 선택) 컴포넌트 신규 분리 |
| **코드 분리** | `components/flow/wizard/WizardProductStep.tsx` | 위저드 2단계 (상품 선택) 컴포넌트 신규 분리 |
| **코드 분리** | `components/flow/wizard/WizardOptionStep.tsx` | 위저드 3단계 (옵션 구성 & 수량) 컴포넌트 신규 분리 |
| **코드 분리** | `components/flow/wizard/WizardCheckoutStep.tsx` | 위저드 4단계 (주문 요약 & 결제) 컴포넌트 신규 분리 (`SelectionCard` 재사용) |
| **코드 분리** | `components/flow/wizard/index.ts` | 위저드 서브컴포넌트 배럴 인덱스 생성 |
| **코드 슬림화** | `components/flow/WizardOrderView.tsx` | 800줄 모놀리스 $\to$ 서브컴포넌트 오케스트레이터로 슬림화 및 방어 로직 추가 |
| **코드 정리** | `components/settings/index.ts` | 누락된 `SegmentedControl` export 추가 |
| **코드 정리** | `app/settings/page.tsx` | 중복 `handleBack` / `handleComplete` 네비게이션 핸들러 단일화 |
| **스타일 정리** | `components/layout/HeaderBar.tsx` | 불필요한 포커스 링 오버라이드 제거 (글로벌 TDS 아웃라인 상속) |
| **스타일 정리** | `components/flow/TableSelectView.tsx` | 불필요한 포커스 링 오버라이드 제거 |
| **테스트 개선** | `tests/unit/wizard.test.tsx` | `act(...)` 래핑으로 React 19 테스트 경고 스팸 박멸 |
| **문서 갱신** | `PRODUCT.md` | 29개 실물 사진(ADR 0013) 및 Web Speech TTS(`useVoiceGuide.ts`) 현황 반영 |
| **문서 갱신** | `plan.md` | 위저드 모드, 한 손 모드, 실물 사진, TTS 안내 최신화 |
| **신규 ADR** | `docs/decisions/0015-wizard-and-one-handed-modes.md` | 위저드 4단계 순차 주문 및 한 손 조작 모드 아키텍처 결정 기록 |
| **신규 ADR** | `docs/decisions/0016-ios15-polyfills-and-tab-gpu-transitions.md` | iOS 15 Safari 호환 폴리필 및 탭 트랜지션 GPU 최적화 기록 |
| **문서 아카이빙** | `docs/HANDOFF-2026-08-17.md` | `[HISTORICAL ARCHIVE]` 명시 및 최신 문서 안내 |
| **문서 아카이빙** | `docs/ux-plan-2026-08-17.md` | `[HISTORICAL ARCHIVE]` 명시 |
| **문서 아카이빙** | `docs/ux-planning-2026-08.md` | `[HISTORICAL ARCHIVE]` 명시 |
| **문서 아카이빙** | `docs/ux-audit.md` | `[HISTORICAL ARCHIVE]` 명시 |
| **문서 개편** | `UPDATE.md` | 단순 복제 파일 제거 $\to$ 본 전수 감사 및 개선 완료 리포트로 개편 |
| **문서 갱신** | `CHANGELOG.md` | 최근 최적화, 위저드 컴포넌트 분리 및 문서 개편 내역 추가 |

---

## 4. 검증 결과 기록 (Verification Record)

| 검증 항목 | 실행 명령어 | 수행 결과 | 비고 |
|---|---|---|---|
| **단위/컴포넌트/A11y 테스트** | `bun run test` | **12개 스위트, 126개 테스트 100% 통과** (4.01s) | axe 접근성 검증 통과, React 19 경고 0건 |
| **정적 분석 (Linter)** | `bun run lint` | **ESLint 에러 0건, 경고 0건** | 완벽한 클린 코드베이스 |
| **프로덕션 빌드** | `bun run build` | **Turbopack 빌드 523ms 완료**, 7개 라우트 정상 생성 | 타입 에러 0건, SSR/정적 생성 정상 |
| **다국어(i18n) 무결성** | `bun run i18n:check` | **6개 네임스페이스 100% 키 일치** | 누락/잉여 번역 키 없음 |

---

## 5. 결론 및 향후 과제 (Roadmap Ahead)

본 전수 감사를 통해 마크다운 문서와 실제 코드베이스 간의 불일치를 100% 해소하였으며, 비대해졌던 위저드 모드를 모듈화하고 중복 코드를 통합하여 프로덕션 아키텍처의 안정성을 한 단계 격상시켰습니다.

향후 Phase 2 진행 시 다음 사항에 집중합니다:
1. **장바구니 TTL 자동 만료 및 동기화** (`TODO.md` 명시 과제).
2. **React Native / Expo 모노레포 포팅**을 통한 진동 API(iOS Safari 미지원 극복) 및 백그라운드 NFC 지원.
3. **실제 PG사(토스페이먼츠 등) 결제 연동** 및 주문 상태 백엔드 웹소켓 연동.
