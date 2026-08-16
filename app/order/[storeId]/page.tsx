import Link from "next/link";
import { StoreService, MenuService } from "@/lib/services";
import { MenuClientView } from "@/components/flow/MenuClientView";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { EmptyCartIllustration } from "@/components/ui/TossIllustrations";

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
        className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center bg-background"
      >
        <EmptyCartIllustration size={96} />
        <div className="flex flex-col gap-1.5 max-w-sm">
          <h1 className="text-2xl font-extrabold text-foreground">주문 링크를 찾지 못했어요</h1>
          <p className="text-base font-medium text-muted-foreground leading-relaxed">
            테이블의 QR 코드나 NFC 태그를 다시 스캔해 주시거나, 샘플 매장으로 이동해 보세요.
          </p>
        </div>
        <Link
          href="/order/jumun-cafe-01?table=1"
          className="mt-3 inline-flex h-14 items-center justify-center rounded-[--radius-md] bg-primary px-6 font-bold text-primary-foreground shadow-none transition-transform active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring outline-none"
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
