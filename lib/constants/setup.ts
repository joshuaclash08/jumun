/** localStorage key — 존재하면 Setup 온보딩 플로우를 건너뜀 */
export const SETUP_COMPLETED_KEY = "jumun:setup-completed";

/** Cookie key — SSR 시 클라이언트 깜빡임 없이 즉시 307 리다이렉트 판정에 사용 */
export const SETUP_COMPLETED_COOKIE = "jumun_setup_completed";

/** Setup 페이지 경로 */
export const SETUP_PATH = "/setup";

/**
 * SetupGuard에서 검사/리다이렉트 없이 바로 통과시키는 경로 접두사 목록.
 * - /setup: 온보딩 진입 화면
 * - /settings, /setting: 사용자가 "네, 설정할래요"를 눌러 세팅을 진행하는 동안 리다이렉트되지 않아야 함
 */
export const EXEMPT_PATH_PREFIXES = ["/setup", "/settings", "/setting"];

/**
 * 주어진 경로가 SetupGuard 검사 예외 대상인지 확인합니다.
 */
export function isSetupExemptPath(pathname: string): boolean {
  return EXEMPT_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * 중첩되거나 부적절한 returnTo 값을 실제 이동해야 할 최종 목적지 경로로 안전하게 정제합니다.
 * 예:
 * - null or "" -> "/"
 * - "/settings", "/setting", "/setup" -> "/"
 * - "/settings?returnTo=/order/1" -> "/order/1"
 * - "/order/1?table=2" -> "/order/1?table=2"
 */
export function sanitizeReturnTo(rawReturnTo: string | null | undefined): string {
  if (!rawReturnTo || rawReturnTo.trim() === "") {
    return "/";
  }

  let current = rawReturnTo.trim();

  // 최대 5번까지 중첩된 /settings?returnTo= 또는 /setup?returnTo= 언래핑
  for (let i = 0; i < 5; i++) {
    if (
      current === "/settings" ||
      current === "/setting" ||
      current === "/setup" ||
      current.startsWith("/settings/") ||
      current.startsWith("/setting/") ||
      current.startsWith("/setup/")
    ) {
      return "/";
    }

    if (
      current.startsWith("/settings?") ||
      current.startsWith("/setting?") ||
      current.startsWith("/setup?")
    ) {
      try {
        const queryPart = current.slice(current.indexOf("?") + 1);
        const params = new URLSearchParams(queryPart);
        const inner = params.get("returnTo");
        if (inner && inner !== current) {
          current = inner;
          continue;
        }
      } catch {
        // parsing failed
      }
      return "/";
    }

    // 정상 경로 (예: /order/jumun-cafe-01?table=2 또는 /)
    break;
  }

  // Next.js 라우트 안전성 검사: 절대 URL 방지 (open redirect 방지)
  if (!current.startsWith("/") || current.startsWith("//")) {
    return "/";
  }

  return current;
}
