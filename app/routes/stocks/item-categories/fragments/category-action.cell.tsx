import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import EditCategoryDialog from "../components/edit-category.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import type { ItemCategoryListItemDto } from "~/services/api/stocks/item-category/dto";

interface CategoryActionCellProps {
  category: ItemCategoryListItemDto;
}

export default function CategoryActionCell({
  category,
}: CategoryActionCellProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canDelete = category.itemCount === 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!canDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
          {!canDelete && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Không thể xóa danh mục có hàng hóa
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <EditCategoryDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        categoryId={category.id}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        category={category}
      />
    </>
  );
}
