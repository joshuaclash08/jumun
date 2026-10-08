export interface CartItemSelection {
  groupId: string;
  optionIds: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  title?: string;
  nameKo?: string;
  optionsSummary?: string;
  quantity: number;
  selections: CartItemSelection[];
  unitPrice: number;
}
