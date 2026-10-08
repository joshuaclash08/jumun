import menuData from "@/lib/data/menu.json";
import type {
  AppLanguage,
  MenuCategory,
  PluginLanguagePack,
  Product,
  ProductCategory,
  ProductOption,
  ProductOptionGroup,
} from "@/lib/types";

// Fictional cafe menu, aligned with Toss POS Plugin SDK PluginCatalogItem schema.
// See docs/decisions/0002-menu-domain.md and https://docs.tossplace.com/reference/plugin-sdk/pos/catalog.html.

function validateCategories(raw: unknown): MenuCategory[] {
  if (!Array.isArray(raw)) {
    throw new Error("menu.json: `categories` must be an array");
  }
  return raw.map((entry: Partial<MenuCategory>, index) => {
    const title = entry?.title || entry?.labelKo;
    if (typeof entry?.id !== "string" || typeof title !== "string") {
      throw new Error(`menu.json: categories[${index}] must have a string id and title/labelKo`);
    }
    return {
      ...entry,
      id: entry.id as ProductCategory,
      title,
      labelKo: entry.labelKo || title,
    } as MenuCategory;
  });
}

function validateOptionGroups(raw: unknown): Record<string, ProductOptionGroup> {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("menu.json: `optionGroups` must be an object");
  }
  const result: Record<string, ProductOptionGroup> = {};
  for (const [id, group] of Object.entries(raw as Record<string, Partial<ProductOptionGroup>>)) {
    if (!group || !Array.isArray(group.options)) {
      throw new Error(`menu.json: optionGroups.${id} is missing a valid \`options\` array`);
    }
    const title = group.title || group.labelKo || "";
    const options: ProductOption[] = group.options.map((opt, optIndex) => {
      const optTitle = opt.title || opt.labelKo;
      if (!opt.id || typeof optTitle !== "string") {
        throw new Error(`menu.json: optionGroups.${id}.options[${optIndex}] is missing id or title`);
      }
      return {
        ...opt,
        title: optTitle,
        labelKo: opt.labelKo || optTitle,
        priceDelta: opt.priceDelta ?? 0,
      };
    });

    result[id] = {
      id,
      title,
      titleI18n: group.titleI18n,
      labelKo: group.labelKo || title,
      required: !!group.required,
      selectionType: group.selectionType || "single",
      maxSelections: group.maxSelections,
      options,
    };
  }
  return result;
}

const CATEGORIES = validateCategories(menuData.categories);
const OPTION_GROUPS = validateOptionGroups(menuData.optionGroups);

interface RawProduct extends Omit<Product, "optionGroups"> {
  optionGroupIds: string[];
}

function validateProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    throw new Error("menu.json: `products` must be an array");
  }
  return (raw as RawProduct[]).map(({ optionGroupIds, ...product }, index) => {
    if (typeof product.id !== "string") {
      throw new Error(`menu.json: products[${index}] is missing a string id`);
    }
    const title = product.title || product.nameKo || product.id;
    const description = product.description || product.descriptionKo || "";
    const voiceDescription = product.voiceDescription || product.voiceDescriptionKo || "";

    const optionGroups = (optionGroupIds ?? []).map((id) => {
      const group = OPTION_GROUPS[id];
      if (!group) {
        throw new Error(
          `menu.json: products[${index}] ("${product.id}") references unknown optionGroup id "${id}"`,
        );
      }
      return group;
    });

    return {
      ...product,
      title,
      nameKo: product.nameKo || title,
      description,
      descriptionKo: product.descriptionKo || description,
      voiceDescription,
      voiceDescriptionKo: product.voiceDescriptionKo || voiceDescription,
      optionGroups,
    };
  });
}

const PRODUCTS: Product[] = validateProducts(menuData.products);

const MOCK_LATENCY_MS = 0;

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCategories(): Promise<MenuCategory[]> {
  await delay(MOCK_LATENCY_MS);
  return CATEGORIES;
}

export async function getAllProducts(): Promise<Product[]> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS;
}

export async function getProductsByCategory(categoryId: ProductCategory): Promise<Product[]> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS.filter((product) => product.category === categoryId);
}

export async function getProduct(productId: string): Promise<Product | null> {
  await delay(MOCK_LATENCY_MS);
  return PRODUCTS.find((product) => product.id === productId) ?? null;
}

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

/**
 * Resolves localized title for a product, category, or option choice.
 * Matches Toss POS Plugin SDK language pack ('en-US' for English).
 */
export function getLocalizedTitle(
  item:
    | {
        title?: string;
        titleI18n?: PluginLanguagePack;
        labelKo?: string;
        nameKo?: string;
      }
    | null
    | undefined,
  language: AppLanguage | string,
  fallback = "",
): string {
  if (!item) return fallback;
  if (language === "en") {
    const en = item.titleI18n?.languages?.["en-US"];
    if (en) return en;
  }
  return item.title || item.nameKo || item.labelKo || fallback;
}

/**
 * Resolves localized description for a product.
 */
export function getLocalizedDescription(
  item:
    | {
        description?: string;
        descriptionI18n?: PluginLanguagePack;
        descriptionKo?: string;
      }
    | null
    | undefined,
  language: AppLanguage | string,
  fallback = "",
): string {
  if (!item) return fallback;
  if (language === "en") {
    const en = item.descriptionI18n?.languages?.["en-US"];
    if (en) return en;
  }
  return item.description || item.descriptionKo || fallback;
}

/**
 * Resolves localized voice TTS prompt for accessibility announcements.
 */
export function getLocalizedVoiceDescription(
  item:
    | {
        voiceDescription?: string;
        voiceDescriptionI18n?: PluginLanguagePack;
        voiceDescriptionKo?: string;
      }
    | null
    | undefined,
  language: AppLanguage | string,
  fallback = "",
): string {
  if (!item) return fallback;
  if (language === "en") {
    const en = item.voiceDescriptionI18n?.languages?.["en-US"];
    if (en) return en;
  }
  return item.voiceDescription || item.voiceDescriptionKo || fallback;
}

/**
 * Validates whether all required option groups for a product have at least one selected option.
 * If language is provided (e.g. "en"), missing group titles are resolved in that language.
 */
export function validateRequiredOptions(
  product: Product,
  selectedOptions: Record<string, string[]>,
  language?: AppLanguage | string,
): { isValid: boolean; missingGroups: string[] } {
  const missingGroups: string[] = [];
  for (const group of product.optionGroups || []) {
    if (group.required) {
      const selected = (selectedOptions[group.id] || []).filter(
        (id) => typeof id === "string" && id.trim().length > 0,
      );
      if (selected.length === 0) {
        const resolvedTitle = language
          ? getLocalizedTitle(group, language)
          : group.title || group.labelKo || group.id;
        missingGroups.push(resolvedTitle || group.id);
      }
    }
  }
  return { isValid: missingGroups.length === 0, missingGroups };
}

