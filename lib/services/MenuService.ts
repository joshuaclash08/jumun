import menuData from "@/lib/data/menu.json";
import type { MenuCategory, Product, ProductCategory, ProductOptionGroup } from "@/lib/types";

// Fictional cafe menu, no real brand -- see docs/decisions/0002-menu-domain.md.
// Source of truth is lib/data/menu.json, not hardcoded TS, so the catalog can
// change without touching this service's logic.

// Runtime shape checks for menu.json, which is hand-edited during content
// updates (see architecture.md). Without these, a typo'd field or an
// optionGroup id that doesn't exist in `optionGroups` type-checks fine via
// the `as` cast and only surfaces as `undefined` reaching a component deep
// in the render tree (e.g. ProductDetailSheet's `.optionGroups.map(...)`).
// Failing loudly here, at module load, catches it at the source instead.
function validateCategories(raw: unknown): MenuCategory[] {
  if (!Array.isArray(raw)) {
    throw new Error("menu.json: `categories` must be an array");
  }
  raw.forEach((entry: Partial<MenuCategory>, index) => {
    if (typeof entry?.id !== "string" || typeof entry?.labelKo !== "string") {
      throw new Error(`menu.json: categories[${index}] must have a string id and labelKo`);
    }
  });
  return raw as MenuCategory[];
}

function validateOptionGroups(raw: unknown): Record<string, ProductOptionGroup> {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("menu.json: `optionGroups` must be an object");
  }
  for (const [id, group] of Object.entries(raw as Record<string, Partial<ProductOptionGroup>>)) {
    if (!group || !Array.isArray(group.options)) {
      throw new Error(`menu.json: optionGroups.${id} is missing a valid \`options\` array`);
    }
  }
  return raw as Record<string, ProductOptionGroup>;
}

const CATEGORIES = validateCategories(menuData.categories);
const OPTION_GROUPS = validateOptionGroups(menuData.optionGroups);

interface RawProduct extends Omit<Product, "optionGroups"> {
  optionGroupIds: string[];
}

// Resolves each product's optionGroupIds against OPTION_GROUPS with a loud
// failure on a dangling id, instead of the previous silent `undefined` entry.
function validateProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    throw new Error("menu.json: `products` must be an array");
  }
  return (raw as RawProduct[]).map(({ optionGroupIds, ...product }, index) => {
    if (typeof product.id !== "string") {
      throw new Error(`menu.json: products[${index}] is missing a string id`);
    }
    const optionGroups = (optionGroupIds ?? []).map((id) => {
      const group = OPTION_GROUPS[id];
      if (!group) {
        throw new Error(
          `menu.json: products[${index}] ("${product.id}") references unknown optionGroup id "${id}"`,
        );
      }
      return group;
    });
    return { ...product, optionGroups };
  });
}

const PRODUCTS: Product[] = validateProducts(menuData.products);

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

/**
 * Pure popularity-ranking rule shared by getPopularProducts (server/service
 * call sites) and FeaturedMenuSection's client-side useMemo, so the "popular
 * items" business rule lives in exactly one place.
 */
export function selectPopularProducts(products: Product[], limit = 4): Product[] {
  return products
    .filter((product) => product.popularityRank !== undefined)
    .sort((a, b) => a.popularityRank! - b.popularityRank!)
    .slice(0, limit);
}

export async function getPopularProducts(limit = 4): Promise<Product[]> {
  await delay(MOCK_LATENCY_MS);
  return selectPopularProducts(PRODUCTS, limit);
}
