// Root fallback -- no encoded storeId/table (direct visit, home-screen
// relaunch, or a QR/NFC read failure). The real entry point is
// /order/[storeId]. See docs/architecture.md.
export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-2xl font-bold text-foreground">Jumun</h1>
      <p className="max-w-sm text-base text-muted-foreground">
        바리어프리 셀프오더 플랫폼 — 기초 공사 진행 중입니다. 테이블의 QR 코드를
        스캔하거나 NFC 태그를 태그해 주세요.
      </p>
    </main>
  );
}
