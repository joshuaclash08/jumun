export type ProductCategory =
  | "coffee"
  | "decaf"
  | "tea"
  | "beverage"
  | "dessert"
  | "bakery"
  | "food"
  | "md"
  | (string & {});

/**
 * Toss POS Plugin SDK Language Pack specification
 * https://docs.tossplace.com/reference/plugin-sdk/pos/languagePack.html
 */
export interface PluginLanguagePack {
  languages: {
    "en-US"?: string;
    [key: string]: string | undefined;
  };
}

export interface MenuCategory {
  id: ProductCategory;
  title?: string;
  titleI18n?: PluginLanguagePack;
  /** Backwards compatibility alias for title */
  labelKo: string;
}

export interface ProductOption {
  id: string;
  title?: string;
  titleI18n?: PluginLanguagePack;
  priceDelta: number;
  /** Backwards compatibility alias for title */
  labelKo: string;
}

export interface ProductOptionGroup {
  id: string;
  title?: string;
  titleI18n?: PluginLanguagePack;
  required: boolean;
  selectionType: "single" | "multiple";
  maxSelections?: number;
  options: ProductOption[];
  /** Backwards compatibility alias for title */
  labelKo: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  title?: string;
  titleI18n?: PluginLanguagePack;
  description?: string;
  descriptionI18n?: PluginLanguagePack;
  voiceDescription?: string;
  voiceDescriptionI18n?: PluginLanguagePack;
  price: number;
  /** Relative URL to menu item photo (e.g. "/images/menu/americano.jpg") */
  imageUrl: string;
  /** Theme background solid color hex (e.g. "#F0EFEA") */
  themeBg?: string;
  optionGroups: ProductOptionGroup[];
  available: boolean;
  /** Popularity-section display rank. Absent = not shown in the popular section. 1 is highest. */
  popularityRank?: number;
  /** Whether the product should display the "인기" badge */
  isPopular?: boolean;
  /** Whether the product should display the "신규" badge */
  isNew?: boolean;
  /** Original price before discount (e.g. for strikethrough display) */
  originalPrice?: number;

  /** Backwards compatibility alias for title */
  nameKo: string;
  /** Backwards compatibility alias for description */
  descriptionKo: string;
  /** Backwards compatibility alias for voiceDescription */
  voiceDescriptionKo: string;
}
