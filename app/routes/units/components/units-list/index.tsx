import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Package } from "lucide-react";
import { Button } from "~/components/ui/button";

interface UnitsDataTableProps {
  units: UnitItemDetailResponseDto[];
  isLoading?: boolean;
  hasFilters?: boolean;
  onAddUnit: () => void;
  onSuccess?: () => void;
}

function UnitsDataTable({
  units,
  isLoading,
  hasFilters,
  onAddUnit,
  onSuccess,
}: UnitsDataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
      </div>
    );
  }

  if (!units || units.length === 0) {
    if (hasFilters) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Package />
            </EmptyMedia>
            <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
            <EmptyDescription>
              Thử điều chỉnh bộ lọc hoặc thay đổi từ khóa tìm kiếm
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Chưa có đơn vị tính nào</EmptyTitle>
          <EmptyDescription>
            Bắt đầu bằng cách thêm đơn vị tính đầu tiên cho hệ thống
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAddUnit}>Thêm đơn vị tính đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={units}
      onSuccess={onSuccess}
    />
  );
}

export default UnitsDataTable;
