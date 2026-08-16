import Link from "next/link";
import { EmptyCartIllustration } from "@/components/ui/TossIllustrations";

interface InvalidOrderLinkNoticeProps {
  title?: string;
  description?: string;
}

// Shared "this order link doesn't resolve" empty state -- reused by the
// order-type entry screen and the table-selection screen, since both can be
// reached with an invalid/unknown storeId.
export function InvalidOrderLinkNotice({
  title = "주문 링크를 찾지 못했어요",
  description = "테이블의 QR 코드나 NFC 태그를 다시 스캔해 주시거나, 샘플 매장으로 이동해 보세요.",
}: InvalidOrderLinkNoticeProps) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center bg-background"
    >
      <EmptyCartIllustration size={96} />
      <div className="flex flex-col gap-1.5 max-w-sm">
        <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
        <p className="text-base font-medium text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <Link
        href="/order/jumun-cafe-01"
        className="mt-3 inline-flex h-14 items-center justify-center rounded-[--radius-md] bg-primary px-6 font-bold text-primary-foreground shadow-none transition-transform active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring outline-none"
      >
        샘플 매장 열기
      </Link>
    </main>
  );
}
