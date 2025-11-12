import { BedDouble } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { MenuCategoryListResponseDto } from "~/services/api/menu-category/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface MenuDataTableProps {
  menuCategories: MenuCategoryListResponseDto;
  isLoading?: boolean;
}
function MenuCategoryDataTable({
  menuCategories,
  isLoading,
}: MenuDataTableProps) {
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

  if (!menuCategories || menuCategories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BedDouble />
          </EmptyMedia>
          <EmptyTitle>Chưa có danh mục thực đơn nào</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có danh mục thực đơn nào trong hệ thống. Hãy bắt đầu bằng
            cách thêm danh mục thực đơn đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <DataTable columns={columns} data={menuCategories} />;
}
export default MenuCategoryDataTable;
