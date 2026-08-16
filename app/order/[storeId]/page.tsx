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

  // A `table` param always means dine-in -- every QR/NFC tag and the
  // dedicated table-selection screen both encode it this way. `type=takeout`
  // is the only other way to resolve a store without picking a table.
  // Neither present means the visitor hasn't chosen dine-in vs. takeout yet.
  const storeInfo = tableValue
    ? await StoreService.resolveStore(storeId, "dine-in", tableValue)
    : typeValue === "takeout"
      ? await StoreService.resolveStore(storeId, "takeout")
      : null;

  if (!storeInfo) {
    if (!tableValue && typeValue !== "takeout") {
      const storeListing = StoreService.getStoreListing(storeId);
      if (storeListing) {
        return <OrderTypeSelectView store={storeListing} />;
      }
    }
    return <InvalidOrderLinkNotice />;
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
