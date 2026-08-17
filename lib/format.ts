/**
 * Formats a numeric amount as a Korean Won price string, e.g. 12000 -> "12,000원".
 */
export function formatKRW(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
