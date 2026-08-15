import { StoreService, MenuService } from "@/lib/services";
import { MenuClientView } from "@/components/flow/MenuClientView";

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

  // Fetch menu data
  const categories = await MenuService.getCategories();
  // Fetch products for all categories
  const productsNested = await Promise.all(
    categories.map((cat) => MenuService.getProductsByCategory(cat.id))
  );
  const products = productsNested.flat();

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background">
      {/* A simple header showing the store and table */}
      <header className="sticky top-0 z-50 bg-background/90 p-4 text-center backdrop-blur-md">
        <h1 className="text-lg font-bold text-foreground">{storeInfo.storeName}</h1>
        <p className="text-sm text-muted-foreground">
          {storeInfo.table}번 테이블
        </p>
      </header>

      <MenuClientView categories={categories} products={products} />
    </main>
  );
}
