import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SETUP_COMPLETED_COOKIE, SETUP_PATH } from "@/lib/constants/setup";
import { StoreService, MenuService } from "@/lib/services";
import { MenuClientView } from "@/components/flow/MenuClientView";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { InvalidOrderLinkNotice } from "@/components/flow/InvalidOrderLinkNotice";
import { OrderTypeSelectView } from "@/components/flow/OrderTypeSelectView";

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<"/order/[storeId]">) {
  const { storeId } = await params;
  const { table, type } = await searchParams;
  const tableValue = Array.isArray(table) ? table[0] : table;
  const typeValue = Array.isArray(type) ? type[0] : type;

  const cookieStore = await cookies();
  const isSetupDone = cookieStore.get(SETUP_COMPLETED_COOKIE)?.value === "true";
  if (!isSetupDone) {
    const returnToQuery = tableValue ? `?table=${tableValue}` : typeValue ? `?type=${typeValue}` : "";
    redirect(`${SETUP_PATH}?returnTo=${encodeURIComponent(`/order/${storeId}${returnToQuery}`)}`);
  }

  // A `table` param always means dine-in -- every QR/NFC tag and the
  // dedicated table-selection screen both encode it this way. `type=takeout`
  // is the only other way to resolve a store without picking a table.
  // Fetch store resolution and menu data concurrently
  const storeInfoPromise = tableValue
    ? StoreService.resolveStore(storeId, "dine-in", tableValue)
    : typeValue === "takeout"
      ? StoreService.resolveStore(storeId, "takeout")
      : Promise.resolve(null);

  const categoriesPromise = MenuService.getCategories();
  const productsPromise = MenuService.getAllProducts();

  const [storeInfo, categories, products] = await Promise.all([
    storeInfoPromise,
    categoriesPromise,
    productsPromise,
  ]);

  if (!storeInfo) {
    if (!tableValue && typeValue !== "takeout") {
      const storeListing = StoreService.getStoreListing(storeId);
      if (storeListing) {
        return <OrderTypeSelectView store={storeListing} />;
      }
    }
    return <InvalidOrderLinkNotice />;
  }

  return (
    <main id="main-content" className="flex min-h-full flex-col bg-background">
      <HeaderBar storeInfo={storeInfo} />
      <MenuClientView categories={categories} products={products} storeInfo={storeInfo} />
    </main>
  );
}
