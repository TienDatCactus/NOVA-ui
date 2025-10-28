import type { MenuCategoryItem } from "~/services/api/menu-category/dto";
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
import { BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";

interface MenuCategoryDataTableProps {
  categories: MenuCategoryItem[];
  isLoading?: boolean;
  onAddCategory: () => void;
  onSelectionChange?: (selectedRows: MenuCategoryItem[]) => void;
  onEdit: (category: MenuCategoryItem) => void;
  onDelete: (category: MenuCategoryItem) => void;
}

function MenuCategoryDataTable({
  categories,
  isLoading,
  onAddCategory,
  onSelectionChange,
  onEdit,
  onDelete,
}: MenuCategoryDataTableProps) {
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

  if (!categories || categories.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyTitle>Chưa có danh mục thực đơn</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có danh mục thực đơn nào trong hệ thống. Hãy bắt đầu bằng
            cách thêm danh mục đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAddCategory}>Thêm danh mục đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={categories}
      onSelectionChange={onSelectionChange}
    />
  );
}

export default MenuCategoryDataTable;
