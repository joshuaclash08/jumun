export type ProductCategory =
  | "coffee"
  | "decaf"
  | "tea"
  | "beverage"
  | "dessert"
  | "bakery"
  | "food"
  | "brunch"
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
  optionGroups: ProductOptionGroup[];
  available: boolean;
}
