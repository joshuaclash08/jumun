import Link from "next/link";
import { StoreService, MenuService } from "@/lib/services";
import { MenuClientView } from "@/components/flow/MenuClientView";
import { HeaderBar } from "@/components/layout/HeaderBar";

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
        className="flex min-h-full flex-col items-center justify-center gap-5 p-6 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-[--radius-xl] bg-destructive/10 text-destructive text-3xl font-bold">
          !
        </div>
        <div className="flex flex-col gap-2 max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">이 주문 링크가 유효하지 않아요</h1>
          <p className="text-base text-muted-foreground">
            테이블의 QR 코드나 NFC 태그를 다시 스캔해 주시거나, 샘플 매장으로 이동해 주세요.
          </p>
        </div>
        <Link
          href="/order/jumun-cafe-01?table=1"
          className="mt-2 inline-flex h-14 items-center justify-center rounded-[--radius-lg] bg-primary px-6 font-bold text-primary-foreground shadow-md transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring outline-none"
        >
          샘플 매장 (1번 테이블) 열기
        </Link>
      </main>
    );
  }

  // Fetch menu data
  const categories = await MenuService.getCategories();
  // Fetch products for all categories
  const productsNested = await Promise.all(
    categories.map((cat) => MenuService.getProductsByCategory(cat.id))
  );
  const products = productsNested.flat();

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background">
      <HeaderBar storeInfo={storeInfo} />
      <MenuClientView categories={categories} products={products} storeInfo={storeInfo} />
    </main>
  );
}
