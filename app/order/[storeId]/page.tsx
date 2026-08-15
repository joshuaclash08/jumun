import { StoreService } from "@/lib/services";

// The real entry point every QR/NFC tag encodes: /order/{storeId}?table={n}.
// Exercises the real chain (route param -> StoreService.resolveStore ->
// null-handling) end to end; the actual menu screen is real feature work for
// a future round, out of scope for this foundation pass.
export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/order/[storeId]">) {
  const { storeId } = await params;
  const { table } = await searchParams;
  const tableValue = Array.isArray(table) ? table[0] : table;

  const storeInfo = tableValue ? await StoreService.resolveStore(storeId, tableValue) : null;

  if (!storeInfo) {
    return (
      <main
        id="main-content"
        className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <h1 className="text-2xl font-bold text-foreground">이 주문 링크가 유효하지 않아요</h1>
        <p className="max-w-sm text-base text-muted-foreground">
          QR 코드나 NFC 태그를 다시 스캔해 주세요.
        </p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-2xl font-bold text-foreground">{storeInfo.storeName}</h1>
      <p className="max-w-sm text-base text-muted-foreground">
        {storeInfo.table}번 테이블 — 메뉴 화면은 다음 라운드에서 만들어집니다.
      </p>
    </main>
  );
}
