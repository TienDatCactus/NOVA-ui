import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import { columns } from "./columns";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { FolderTree } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { DataTable } from "./data-table";

interface StaffListProps {
  staffs: StaffListItemDto[];
  isLoading?: boolean;
}

export default function StaffDataTable({ staffs, isLoading }: StaffListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
      </div>
    );
  }

  if (!staffs || staffs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTree />
          </EmptyMedia>
          <EmptyTitle>Chưa có nhân viên</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có nhân viên nào trong hệ thống. Hãy bắt đầu bằng cách thêm
            nhân viên đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={staffs} />
    </div>
  );
}
