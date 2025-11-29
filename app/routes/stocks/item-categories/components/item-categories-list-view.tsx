import { PackageX } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import type { ItemCategoryListItemDto } from "~/services/api/stocks/item-category/dto";
import ItemCategoriesList from "./item-categories-list";
import CreateCategoryDialog from "./create-category.dialog";

interface ItemCategoriesListViewProps {
  categories: ItemCategoryListItemDto[];
  isLoading: boolean;
}

export default function ItemCategoriesListView({
  categories,
  isLoading,
}: ItemCategoriesListViewProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageX />
          </EmptyMedia>
          <EmptyTitle>Chưa có danh mục hàng hóa nào.</EmptyTitle>
          <EmptyDescription>Tạo danh mục đầu tiên để bắt đầu</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => setOpenCreateDialog(true)}>
            Tạo danh mục hàng hóa
          </Button>
        </EmptyContent>
        <CreateCategoryDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
        />
      </Empty>
    );
  }

  return <ItemCategoriesList data={categories} />;
}
