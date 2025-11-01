import { Package } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { MenuItem } from "~/services/api/menu-item/dto";
import { getColumns } from "./columns";
import { MenuItemsDataTable } from "./data-table";

interface MenuItemsListProps {
  data: MenuItem[];
  isLoading?: boolean;
  onSelectionChange?: (selectedRows: MenuItem[]) => void;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
}

export default function MenuItemsList({
  data,
  isLoading,
  onSelectionChange,
  onEdit,
  onDelete,
}: MenuItemsListProps) {
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

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Không có món ăn nào</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có món ăn nào trong hệ thống. Hãy bắt đầu bằng cách thêm
            món ăn đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const columns = getColumns({ onEdit, onDelete });
  return (
    <MenuItemsDataTable
      columns={columns}
      data={data}
      onSelectionChange={onSelectionChange}
    />
  );
}
