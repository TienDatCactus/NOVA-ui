import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
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
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import EditMenuCategorySheet from "../../components/edit-menu-category.sheet";

interface MenuCategoryActionsCellProps {
  category: MenuCategoryItemDto;
}

export default function MenuCategoryActionsCell({
  category,
}: MenuCategoryActionsCellProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
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
          <DropdownMenuItem onClick={() => setUpdateSheetOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={category}
      />
      <EditMenuCategorySheet
        open={updateSheetOpen}
        onClose={() => setUpdateSheetOpen(false)}
        categoryId={category.id}
      />
    </>
  );
}
