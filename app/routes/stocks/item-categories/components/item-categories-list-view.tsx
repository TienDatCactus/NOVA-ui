import { PackageX } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import ItemCategoriesList from "./item-categories-list";
import type { ItemCategoryListItemDto } from "~/services/api/stocks/item-category/dto";

interface ItemCategoriesListViewProps {
  categories: ItemCategoryListItemDto[];
  isLoading: boolean;
}

export default function ItemCategoriesListView({
  categories,
  isLoading,
}: ItemCategoriesListViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <PackageX />
        </EmptyMedia>
        <EmptyTitle>Chưa có danh mục hàng hóa nào.</EmptyTitle>
        <EmptyDescription>Tạo danh mục đầu tiên để bắt đầu</EmptyDescription>
      </Empty>
    );
  }

  return <ItemCategoriesList data={categories} />;
}
