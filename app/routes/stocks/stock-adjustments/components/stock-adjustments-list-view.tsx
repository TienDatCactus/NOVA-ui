import { FileWarning } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { StockAdjustmentListDto } from "~/services/api/stocks/stock-adjustments/dto";
import StockAdjustmentsDataTable from "./stock-adjustments-list";
import { useState } from "react";
import CreateStockAdjustmentDialog from "./create-stock-adjustment.dialog";
import { Button } from "~/components/ui/button";

interface StockAdjustmentsListViewProps {
  adjustments: StockAdjustmentListDto;
  isLoading: boolean;
}

export default function StockAdjustmentsListView({
  adjustments,
  isLoading,
}: StockAdjustmentsListViewProps) {
  return (
    <div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : adjustments.length === 0 ? (
        <EmptyState />
      ) : (
        <StockAdjustmentsDataTable adjustments={adjustments} />
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
    <>
      <Empty>
        <EmptyMedia variant="icon">
          <FileWarning />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Không tìm thấy phiếu điều chỉnh</EmptyTitle>
          <EmptyDescription>
            Thử thay đổi bộ lọc hoặc tạo phiếu mới
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => setOpenCreateDialog(true)}>
            Tạo phiếu mới
          </Button>
        </EmptyContent>
      </Empty>
      <CreateStockAdjustmentDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
      />
    </>
  );
}
