import { FileText } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { PurchaseRequestListDto } from "~/services/api/stocks/purchase-requests/dto";
import PurchaseRequestsDataTable from "./purchase-requests-list";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreatePurchaseRequestDialog from "./create-purchase-request.dialog";

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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <FileText />
        </EmptyMedia>
        <EmptyHeader>Không tìm thấy yêu cầu mua hàng</EmptyHeader>
        <EmptyDescription>
          Thử thay đổi bộ lọc hoặc tạo yêu cầu mua hàng mới
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => setOpenCreateDialog(true)}>
          Tạo yêu cầu mua hàng
        </Button>
      </EmptyContent>
      <CreatePurchaseRequestDialog
        onOpenChange={setOpenCreateDialog}
        open={openCreateDialog}
      />
    </Empty>
  );
}
