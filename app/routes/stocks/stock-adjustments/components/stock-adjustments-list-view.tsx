import { FileWarning } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { StockAdjustmentListDto } from "~/services/api/stocks/stock-adjustments/dto";
import StockAdjustmentsDataTable from "./stock-adjustments-list";

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
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <FileWarning />
      </EmptyMedia>
      <EmptyHeader>Không tìm thấy phiếu điều chỉnh</EmptyHeader>
      <EmptyDescription>
        Thử thay đổi bộ lọc hoặc tạo phiếu mới
      </EmptyDescription>
    </Empty>
  );
}
