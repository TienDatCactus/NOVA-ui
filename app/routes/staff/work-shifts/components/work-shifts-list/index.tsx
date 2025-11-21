import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";
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
import { Clock } from "lucide-react";
import { Button } from "~/components/ui/button";

interface WorkShiftsDataTableProps {
  workShifts: WorkShiftListItem[];
  isLoading?: boolean;
  hasFilters?: boolean;
  onAddWorkShift: () => void;
  onSuccess?: () => void;
}

export default function WorkShiftsDataTable({
  workShifts,
  isLoading,
  hasFilters,
  onAddWorkShift,
  onSuccess,
}: WorkShiftsDataTableProps) {
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

  if (!workShifts || workShifts.length === 0) {
    if (hasFilters) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock />
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
            <Clock />
          </EmptyMedia>
          <EmptyTitle>Chưa có ca làm việc nào</EmptyTitle>
          <EmptyDescription>
            Bắt đầu bằng cách thêm ca làm việc đầu tiên cho hệ thống
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAddWorkShift}>Thêm ca làm việc đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={workShifts} onSuccess={onSuccess} />
    </div>
  );
}
