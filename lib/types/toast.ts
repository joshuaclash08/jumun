export interface ToastItem {
  id: string;
  messageKo: string;
  messageEn?: string;
  kind: "success" | "error";
  variant?: "cart" | "staff-call" | "delete" | "generic";
  onUndo?: () => void;
}
