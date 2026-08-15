import { CATEGORIES, PRODUCTS } from "@/lib/data/menu";
import type { MenuCategory, Product, ProductCategory } from "@/lib/types";

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
