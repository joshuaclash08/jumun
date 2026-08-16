export type ProductCategory = "coffee" | "beverage" | "dessert" | "food";

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
  /** lucide-react icon export name (e.g. "Coffee"), one per product -- see components/flow/ProductCard.tsx */
  icon: string;
  optionGroups: ProductOptionGroup[];
  available: boolean;
}
