# UX / 구조 / 로직 / 시스템 감사 (2026-08-16)

> [!NOTE] **HISTORICAL ARCHIVE (2026-08-16)**  
> 이 문서는 2026년 8월 16일 기준의 초기 시스템 감사 기록입니다.  
> 2026년 10월 현재 최신 프로젝트 상태, 아키텍처 및 구현 스펙은 [README.md](../README.md), [UPDATE.md](../UPDATE.md), [docs/features.md](features.md), [docs/architecture.md](architecture.md)를 참조하십시오.

전체 코드베이스(`app/`, `components/`, `lib/`, `store/`, `docs/`)를 읽고 정리한 문제 목록. 각 항목은 `파일:줄` 참조와 함께 "왜 문제인지"와 "권고안"을 적었다. 이 문서를 근거로 후속 구현 작업(`docs/decisions/`, `CHANGELOG.md`)을 진행한다.

> 참고: `AGENTS.md`의 "이건 당신이 아는 Next.js가 아니다" 경고는 실제로 `next dev`(v16.3.1 canary)가 자동 생성하는 정상 기능이다 (`node_modules/next/dist/server/lib/generate-agent-files.js` 실존, `node_modules/next/dist/docs/` 실존 확인). 프롬프트 인젝션이 아니라 진짜 브레이킹체인지 경고이므로 무시하지 않고 라우팅 관련 작업 전에 참고했다.

---

## 1. 데이터/아키텍처 — 하드코딩 문제

| # | 위치 | 문제 |
|---|---|---|
| 1.1 | [lib/data/menu.ts](../lib/data/menu.ts) | 메뉴 카테고리·상품·옵션이 전부 TS 상수로 하드코딩됨. `MenuService`가 이 모듈을 직접 `import`하므로 메뉴를 바꾸려면 코드를 수정하고 재배포해야 함. |
| 1.2 | [lib/services/StoreService.ts:18](../lib/services/StoreService.ts#L18) | 매장 목록(`MOCK_STORES`)도 서비스 파일 내부에 하드코딩. `AvailableStoreItem` 타입도 `lib/types` 배럴에 속하지 않고 이 파일 안에서만 정의됨 — 나머지 타입들(`Product`, `CartItem`, `StoreInfo`)과 다른 위치에 있어 일관성이 깨짐. |
| 1.3 | [lib/types/menu.ts](../lib/types/menu.ts) / [components/flow/ProductCard.tsx:18](../components/flow/ProductCard.tsx#L18) | `Product` 타입에 아이콘 필드가 없음. 대신 `ProductCard`가 카테고리 4종에 대해서만 Lucide 아이콘을 매핑(`CATEGORY_ICONS`)해서, 같은 카테고리의 모든 상품이 완전히 동일한 아이콘을 공유함 (예: 아메리카노/카페라떼/바닐라라떼가 전부 같은 `Coffee` 아이콘). `docs/design-system.md`의 Imagery 항목은 "상품별(per-item)" 일러스트를 명시하는데 실제 구현은 "카테고리별(per-category)"이라 스펙 미달. |

**권고**: `data/stores.json`, `data/menu.json`로 이관하고 `Product`에 `icon` 필드를 추가해 상품 단위로 아이콘·가격·사이즈·옵션을 전부 JSON 안에 넣는다. 서비스 레이어(`MenuService`/`StoreService`)의 `Promise` 기반 시그니처는 그대로 유지 — 나중에 실제 백엔드로 교체할 때 호출부가 바뀌지 않도록 한 기존 설계(`docs/architecture.md`)를 존중.

---

## 2. 버그

### 2.1 카테고리 스크롤 시 탭 텍스트 깜빡임 (사용자가 지적한 버그)

[components/flow/MenuClientView.tsx:57-81](../components/flow/MenuClientView.tsx#L57-L81)

```tsx
const handleIntersect: IntersectionObserverCallback = (entries) => {
  if (isProgrammaticScroll.current) return;
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const catId = entry.target.id.replace("category-", "");
      setActiveCategoryId(catId);   // ← 매 intersecting entry마다 무조건 덮어씀
    }
  });
};
```

**원인**: `rootMargin: "-20% 0px -70% 0px"`로 화면 중상단 10% 폭의 "감지 밴드"를 만드는데, 상품 개수가 적은 카테고리(디저트 2개 등)는 섹션 높이가 짧아서 인접한 두 섹션이 동시에 이 밴드에 걸리는 경우가 흔하다. 이때 한 번의 콜백에 여러 `entry`가 들어오고, `forEach`가 그중 마지막 것으로 무조건 덮어쓰기 때문에 스크롤 중 활성 탭이 두 카테고리 사이를 빠르게 오가며 깜빡인다 (`MenuCategoryHeader`의 `layoutId` 공유 애니메이션과 텍스트 색상이 매 프레임 토글됨).

**권고**: `entries` 중 "가장 우세한(topmost 혹은 intersectionRatio가 가장 큰)" 섹션 하나만 선택하도록 로직을 바꾸고, 현재 값과 동일하면 `setState`를 호출하지 않는다.

### 2.2 `role="tablist"`/`role="tab"` 오용

[components/flow/MenuCategoryHeader.tsx:38,44,51](../components/flow/MenuCategoryHeader.tsx#L38)

이 컴포넌트는 실제로는 "스크롤 스파이" 내비게이션이다 (하나의 스크롤 페이지 안에서 현재 위치를 표시). 그런데 ARIA `tablist`/`tab` 패턴을 흉내내고 있어, 스크린리더 사용자는 화살표 키 이동·`tabpanel` 연결을 기대하지만 실제로는 아무것도 없다 (`aria-controls`도 없음, roving `tabIndex`도 없음). 이 제품의 정체성이 접근성이라는 점에서 이건 사소한 흠이 아니다.

**권고**: `role="tablist"/"tab"/aria-selected` → `<nav>` + 일반 버튼 + `aria-current="true"`로 교체.

### 2.3 리듀스모션 설정이 랜딩 히어로 애니메이션의 "간격"까지는 못 끔

[components/flow/LandingHeroVisual.tsx:16-21](../components/flow/LandingHeroVisual.tsx#L16-L21)

```tsx
React.useEffect(() => {
  const interval = setInterval(() => {
    setScanAnimMode((prev) => (prev === "nfc" ? "qr" : "nfc"));
  }, 3000);
  return () => clearInterval(interval);
}, []);
```

`AnimatePresence`의 크로스페이드 자체는 `reduceMotion`이면 `duration: 0`으로 순간전환되지만(정상), 3초마다 `setInterval`이 무조건 도형을 통째로 바꿔치기하는 로직 자체는 `reduceMotion`과 무관하게 계속 돈다. 즉 모션을 껐다고 설정한 사용자도 3초마다 아이콘이 순간적으로 바뀌는 "깜빡임(strobing)"을 계속 본다. `DESIGN.md`/`docs/design-system.md`가 명시한 "reduceMotion이면 모든 애니메이션이 즉시/꺼짐, 예외 없음" 원칙 위반.

**권고**: `reduceMotion`이 true면 `setInterval` 자체를 걸지 않고 한 도형(NFC)에 고정.

---

## 3. 내비게이션 / 정보구조 (IA)

### 3.1 설정이 팝업(Drawer)인데 내용이 7개 섹션 — 스크롤 필요

[components/flow/SettingsSheet.tsx](../components/flow/SettingsSheet.tsx) 전체 — 고대비, 글자 크기, 애니메이션, 난독증 간격, 햅틱, 타임아웃 연장, 언어까지 7개 카드가 하나의 바텀시트 안에 쌓여 내부 스크롤이 필요하다. "언제든 열 수 있는 접근성 패널"이라는 제품의 핵심 기능치고는 한 화면에 밀도가 너무 높다.

### 3.2 직원 호출 버튼이 메뉴 최하단에 매몰

[components/flow/MenuClientView.tsx:153-168](../components/flow/MenuClientView.tsx#L153-L168) — "직원 호출하기"가 전체 메뉴 목록을 다 스크롤해야 나오는 페이지 맨 아래 카드 안에 있다. 도움이 급히 필요한 사용자(이 제품의 핵심 타깃)가 메뉴 전체를 스크롤해야만 도달 가능한 위치라는 게 정확히 이 제품이 풀려는 문제(키오스크에서 도움 요청이 어려움)를 반복하고 있다.

### 3.3 확인 모달 두 개가 시트 패턴을 깨고 있음

`docs/design-system.md`는 바텀시트를 "signature component"로, "모든 시트가 하나의 통일된 모션 시그니처를 쓴다"고 명시한다. 그런데:
- [components/flow/MenuClientView.tsx:197-231](../components/flow/MenuClientView.tsx#L197) 직원 호출 확인이 센터 `<Dialog>`
- [components/flow/QrScannerModal.tsx:101](../components/flow/QrScannerModal.tsx#L101) QR 스캔 모달도 센터 `<Dialog>`

나머지 전부(장바구니/상품상세/결제/설정)는 `<Drawer>`. 두 곳만 다른 패턴이라 "이 앱의 시트는 항상 아래에서 올라온다"는 학습된 기대를 깬다.

---

## 4. 레이아웃 / 공간 활용

### 4.1 랜딩 페이지 매장 선택 섹션의 임의 너비값

[components/flow/LandingClientView.tsx:39](../components/flow/LandingClientView.tsx#L39) — `w-full max-w-sm px-4 pt-5 pb-10`. `max-w-sm`(384px)은 앱 셸이 실제로 지원하는 `max-w-[768px]`(Galaxy Z Fold5 대응, `app/layout.tsx:46` 및 `CHANGELOG.md`의 변경 이력 참고)보다 훨씬 좁아서, 넓은 화면에서 불필요하게 레터박싱된다. 헤드라인은 `max-w-xs`(line 28), 매장 리스트는 `max-w-sm` — 토큰화되지 않은 임의값이 화면마다 다르게 쓰임.

### 4.2 ProductCard의 80×80 아이콘 슬롯이 정보 밀도 대비 과도하게 큼

[components/flow/ProductCard.tsx:58-63](../components/flow/ProductCard.tsx#L58-L63) — `h-20 w-20`(80px) 박스 안에 `h-8 w-8`(32px) 아이콘 하나. 카테고리당 아이콘이 동일하니(1절 참고) 이 공간은 상품을 구별하는 데 기여하는 정보가 없다. 설명 텍스트는 `line-clamp-2`로 잘림.

**주의**: `DESIGN.md`는 "단일 컬럼, 대시보드형 멀티패널 금지"를 명시적으로 규정하므로, 2열 그리드로 바꾸는 건 기존 설계 원칙과 충돌한다. 해결책은 그리드 전환이 아니라 카드 내부 재설계(상품별 실제 아이콘 + 여백 축소)여야 한다.

---

## 5. 디자인 시스템 파편화 ("AI slop" 원인 분석)

`docs/decisions/0005-toss-tds-vs-shadcn.md`는 이미 "TDS Mobile 패키지 자체는 채택하지 않고 shadcn+Radix 위에 Toss 느낌의 토큰 레이어를 얹는다"고 **결정 완료**된 상태다 (React19/RSC와 `@emotion/react`의 구조적 비호환 때문). 즉 "라이브러리 교체"가 아니라 **이미 있는 토큰/컴포넌트를 일관되게 쓰지 않는 것**이 파편화의 진짜 원인이다. 증거:

| # | 문제 | 근거 |
|---|---|---|
| 5.1 | **Card 이중 경계선.** `components/ui/card.tsx:15`의 `Card` 프리미티브는 이미 `ring-1 ring-foreground/10`으로 경계를 표현한다. `DESIGN.md` Cards 절도 "Border: none by default — shadow + lift가 경계"라고 명시. 그런데 실사용처 거의 전부가 `border border-border/60`을 겹쳐 쓴다: [ProductCard.tsx:53](../components/flow/ProductCard.tsx#L53), [CartDrawer.tsx:67](../components/flow/CartDrawer.tsx#L67), [CheckoutSheet.tsx:168](../components/flow/CheckoutSheet.tsx#L168), [SettingsSheet.tsx](../components/flow/SettingsSheet.tsx) 7곳 전부, [ProductDetailSheet.tsx:186](../components/flow/ProductDetailSheet.tsx#L186). | 프리미티브가 정의한 경계 스타일을 매 사용처가 다르게 재발명 — "토큰 하나, 소스 오브 트루스 하나"라는 `docs/tech-stack.md`의 원칙과 정반대. |
| 5.2 | **라운드값이 4개 토큰(8/12/20/9999px) 밖에서 임의로 쓰임.** `rounded-2xl`(16px, 미정의 값)이 ProductCard, CheckoutSheet의 SelectionCard, ProductDetailSheet 옵션 버튼, MenuClientView 직원호출 카드 등 최소 6곳에서, `rounded-3xl`(24px)이 Dialog 두 곳에서 쓰임. `DESIGN.md` Shapes 절: "no component gets to pick its own value outside this set." | `app/globals.css:35-38`에 `--radius-sm/md/lg/xl`(8/12/20/24)가 정의돼 있는데도 실제 클래스는 raw Tailwind 유틸(`rounded-2xl`/`rounded-3xl`)을 쓰고 있어 토큰과 무관하게 따로 놈. |
| 5.3 | **이모지와 Lucide 아이콘 혼용.** `CartDrawer.tsx:45`의 빈 장바구니 상태 `🛒`, `QrScannerModal.tsx:115`의 카메라 에러 `📷`, `CheckoutSheet.tsx:137`의 에러 배너 `⚠️`. 나머지 전체는 `lucide-react` SVG 아이콘 시스템(`docs/tech-stack.md`가 명시적으로 선택한 유일 아이콘셋). | 이모지는 폰트/OS별로 렌더링이 다르고 스트로크 두께·색상을 시스템과 맞출 수 없어 "생성형 스캐폴드" 느낌을 주는 대표적 패턴. |
| 5.4 | **색상 토큰이 문서마다 다른 값으로 적혀 있음(3중 드리프트).** `DESIGN.md` 프론트매터: `surface: "#FFFFFF"`. `app/globals.css:48`: `--card: #f9f8f6`("Lifted Linen"). `docs/design-system.md:120`: `--color-surface (#FBF9F5)`. 세 값이 다 다르다. | `docs/tech-stack.md`가 스스로 내세운 "디자인 토큰이 곧 CSS 커스텀 프로퍼티, 두 시스템으로 갈라지지 않는다"는 원칙이 이미 깨진 사례. |
| 5.5 | **시트 패턴 이탈** (3.3과 동일 항목, 디자인 일관성 관점에서 재언급). | — |

**결론**: 라이브러리를 더 추가하거나 TDS를 실제로 들여올 필요는 없다(ADR 0005가 이미 그 길을 막아둔 근거가 여전히 유효 — React 19 RSC). 대신 **컴포넌트 프리미티브가 이미 정의한 값을 소비처들이 재정의하지 못하게 하는 정리 작업**이 "파편화 해소"의 실체다.

---

## 6. 접근성

| # | 위치 | 문제 |
|---|---|---|
| 6.1 | 2.2와 동일 | `tablist`/`tab` 오용 — 스크린리더 사용자에게 잘못된 인터랙션 기대를 심음. |
| 6.2 | 3.2와 동일 | 도움 요청 버튼의 낮은 발견성은 기능 문제이자 접근성 문제 (`PRODUCT.md`가 정의한 핵심 타깃 사용자에게 직접 영향). |
| 6.3 | [ProductCard.tsx:58-63](../components/flow/ProductCard.tsx#L58-L63) | 아이콘 슬롯이 `aria-hidden`이라 스크린리더엔 영향 없지만, 시각적으로도 정보가 없는 장식 요소가 카드 폭의 상당 부분을 차지 — 저시력 사용자가 스캔해야 할 실제 텍스트(이름/설명/가격) 영역이 그만큼 좁아짐. |

---

## 7. 사용자 요청 항목별 결정 사항

| 요청 | 결정 | 근거 |
|---|---|---|
| 랜딩 카피 문장 제거 or 개선 | **대폭 축소/제거.** 헤드라인("테이블 태그에 폰을 대거나 QR 코드를 스캔하세요") + 애니메이션 비주얼이 이미 같은 정보를 전달 중이라 하단 문장은 동어반복. `docs/design-system.md`의 "Operate 모드는 설득보다 스캔 용이성" 원칙과도 맞음. | 5절 참고 |
| `max-w-sm` 컴포넌트 재구축 | 앱 셸 폭(`max-w-[768px]`)에 맞는 토큰 기반 컨테이너로 교체, 카드형 리스트로 재설계 | 4.1절 |
| 매장/메뉴 JSON화 | `data/stores.json`, `data/menu.json` 신설. `Product`에 `icon` 필드 추가 | 1절 |
| 설정을 팝업 대신 전용 페이지로 | **동의하되 새 ADR로 기록.** `docs/decisions/0003-navigation-paradigm.md`는 "부가 콘텐츠는 라우트 전환이 아니라 시트로"라고 명시했었지만, 설정처럼 (a) 특정 주문 흐름 중간 지점이 아니고 (b) 매장/테이블에 스코프되지 않고 전역이며(`docs/architecture.md`의 cross-venue persistence) (c) 7개 섹션으로 스스로 이미 "화면 하나"만큼 크다는 점에서 예외로 문서화. 참고 스크린샷(워크스페이스 드롭다운)의 "아이콘+라벨+구분선" 리스트 패턴을 채택. | 3.1절, 7절 |
| 호출 버튼 위치 | **헤더의 설정 아이콘 옆.** 결제 버튼(`CartSummaryPill`)은 장바구니가 비면 아예 렌더링되지 않으므로 그 옆에 두면 카트가 비어있을 때 호출 버튼도 사라짐 — 도움 요청은 카트 상태와 무관하게 항상 가능해야 하므로 부적절. 헤더는 항상 sticky로 떠 있음. | 3.2절 |
| 카드 공간 활용 재디자인 | 그리드 전환 대신 카드 내부 밀도 개선(상품별 아이콘 + 여백 축소) | 4.2절 |
| 카테고리 헤더 깜빡임 | IntersectionObserver 로직 수정 | 2.1절 |
| shadcn 파편화 / "AI slop" | 라이브러리 교체 아님. 프리미티브 재사용 강제 + 토큰 통일 | 5절 |

---

## 8. 우선순위

1. **버그 수정** (2.1, 2.2, 2.3) — 사용자 체감 품질에 직접 영향, 리스크 낮음.
2. **데이터 JSON화** (1절) — 이후 작업(카드 재디자인, 아이콘)의 전제 조건.
3. **설정 전용 페이지 + 호출 버튼 이동** (3절) — IA 변경, 새 ADR 필요.
4. **랜딩/카드 재디자인** (4절).
5. **디자인 시스템 통일 패스** (5절) — 전 컴포넌트에 걸친 정리라 마지막.
