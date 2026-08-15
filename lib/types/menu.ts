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
  optionGroups: ProductOptionGroup[];
  available: boolean;
}
