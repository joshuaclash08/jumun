import menuData from "@/lib/data/menu.json";
import type { MenuCategory, Product, ProductCategory, ProductOptionGroup } from "@/lib/types";

// Fictional cafe menu, no real brand -- see docs/decisions/0002-menu-domain.md.
// Source of truth is lib/data/menu.json, not hardcoded TS, so the catalog can
// change without touching this service's logic.

const CATEGORIES = menuData.categories as MenuCategory[];
const OPTION_GROUPS = menuData.optionGroups as Record<string, ProductOptionGroup>;

interface RawProduct extends Omit<Product, "optionGroups"> {
  optionGroupIds: string[];
}

const PRODUCTS: Product[] = (menuData.products as RawProduct[]).map(
  ({ optionGroupIds, ...product }) => ({
    ...product,
    optionGroups: optionGroupIds.map((id) => OPTION_GROUPS[id]),
  })
);

const MOCK_LATENCY_MS = 200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCategories(): Promise<MenuCategory[]> {
  await delay(MOCK_LATENCY_MS);
  return CATEGORIES;
}

export async function getProductsByCategory(categoryId: ProductCategory): Promise<Product[]> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS.filter((product) => product.category === categoryId);
}

export async function getProduct(productId: string): Promise<Product | null> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

export async function getPopularProducts(limit = 4): Promise<Product[]> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS.filter((product) => product.popularityRank !== undefined)
    .sort((a, b) => a.popularityRank! - b.popularityRank!)
    .slice(0, limit);
}
