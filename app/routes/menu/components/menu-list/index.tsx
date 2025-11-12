import type { MenuListResponseDto } from "~/services/api/menu/dto";
import { columns } from "./columns";
import { Skeleton } from "~/components/ui/skeleton";
import { BedDouble } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { DataTable } from "./data-table";
interface MenuDataTableProps {
  menu: MenuListResponseDto;
  isLoading?: boolean;
}
function MenuDataTable({ menu, isLoading }: MenuDataTableProps) {
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

  if (!menu || menu.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BedDouble />
          </EmptyMedia>
          <EmptyTitle>Chưa có thực đơn nào</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có thực đơn nào trong hệ thống. Hãy bắt đầu bằng cách thêm
            thực đơn đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <DataTable columns={columns} data={menu} />;
}
export default MenuDataTable;
