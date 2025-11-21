import { FileText } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { PurchaseRequestListDto } from "~/services/api/stocks/purchase-requests/dto";
import PurchaseRequestsDataTable from "./purchase-requests-list";

interface PurchaseRequestsListViewProps {
  purchaseRequests: PurchaseRequestListDto;
  isLoading: boolean;
}

export default function PurchaseRequestsListView({
  purchaseRequests,
  isLoading,
}: PurchaseRequestsListViewProps) {
  return (
    <div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : purchaseRequests.length === 0 ? (
        <EmptyState />
      ) : (
        <PurchaseRequestsDataTable purchaseRequests={purchaseRequests} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Empty>
      <EmptyMedia variant={"icon"}>
        <FileText />
      </EmptyMedia>
      <EmptyHeader>Không tìm thấy yêu cầu mua hàng</EmptyHeader>
      <EmptyDescription>
        Thử thay đổi bộ lọc hoặc tạo yêu cầu mua hàng mới
      </EmptyDescription>
    </Empty>
  );
}
