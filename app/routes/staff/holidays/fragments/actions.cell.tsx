import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import UpdateHolidayDialog from "../components/holiday-update-dialog";
import DeleteHolidayDialog from "../components/holiday-delete-dialog";

interface ActionsMenuCellProps {
  holiday: HolidayListItem;
  onSuccess?: () => void;
}

export default function ActionsMenuCell({
  holiday,
  onSuccess,
}: ActionsMenuCellProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateHolidayDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        holiday={holiday}
        onSuccess={onSuccess}
      />

      <DeleteHolidayDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        holiday={holiday}
        onSuccess={onSuccess}
      />
    </>
  );
}
