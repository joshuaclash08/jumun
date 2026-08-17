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

export interface MenuCategory {
  id: ProductCategory;
  labelKo: string;
}

export interface ProductOption {
  id: string;
  labelKo: string;
  priceDelta: number;
}

export interface ProductOptionGroup {
  id: string;
  labelKo: string;
  required: boolean;
  selectionType: "single" | "multiple";
  maxSelections?: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  category: ProductCategory;
  nameKo: string;
  descriptionKo: string;
  voiceDescriptionKo: string;
  price: number;
  /** Relative URL to menu item photo (e.g. "/images/menu/americano.jpg") */
  imageUrl: string;
  /** Theme background solid color hex (e.g. "#F0EFEA") */
  themeBg?: string;
  optionGroups: ProductOptionGroup[];
  available: boolean;
  /** Popularity-section display rank. Absent = not shown in the popular section. 1 is highest. */
  popularityRank?: number;
}

