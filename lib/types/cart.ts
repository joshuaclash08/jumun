export interface CartItemSelection {
  groupId: string;
  optionIds: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  nameKo?: string;
  optionsSummary?: string;
  quantity: number;
  selections: CartItemSelection[];
  unitPrice: number;
}

export interface ToastItem {
  id: string;
  messageKo: string;
  kind: "success" | "error";
  onUndo?: () => void;
}
