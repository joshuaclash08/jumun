import { StoreService } from "@/lib/services";
import { TableSelectView } from "@/components/flow/TableSelectView";
import { InvalidOrderLinkNotice } from "@/components/flow/InvalidOrderLinkNotice";

export default async function TableSelectPage({
  params,
}: PageProps<"/order/[storeId]/table">) {
  const { storeId } = await params;
  const storeListing = StoreService.getStoreListing(storeId);

  if (!storeListing) {
    return <InvalidOrderLinkNotice />;
  }

  return <TableSelectView store={storeListing} />;
}
