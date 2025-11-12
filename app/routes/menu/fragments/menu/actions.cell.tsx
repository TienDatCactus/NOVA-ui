import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { useState } from "react";

import EditMenuSheet from "../../components/edit-menu.sheet";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import { toast } from "sonner";

interface MenuActionsCellProps {
  menuItem: MenuListItemDto;
}

export default function MenuActionsCell({ menuItem }: MenuActionsCellProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const canDelete = menuItem.active === false;

  const handleDeleteClick = () => {
    if (!canDelete) {
      toast.error(
        "Chỉ được xóa phòng khi trạng thái là OutOfService. Hãy chuyển trạng thái rồi thử lại."
      );
      return;
    }
    setDeleteDialogOpen(true);
  };
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
          <DropdownMenuItem onClick={() => setEditSheetOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDeleteClick}
            disabled={!canDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        menuItem={menuItem}
      />
      <EditMenuSheet
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        menuItem={menuItem}
      />
    </>
  );
}
