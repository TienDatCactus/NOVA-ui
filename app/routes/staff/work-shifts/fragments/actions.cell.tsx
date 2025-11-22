import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";
import UpdateWorkShiftDialog from "../components/work-shift-update-dialog";
import DeleteWorkShiftDialog from "../components/work-shift-delete-dialog";

interface ActionsMenuCellProps {
  workShift: WorkShiftListItem;
  onSuccess?: () => void;
}

export default function ActionsMenuCell({
  workShift,
  onSuccess,
}: ActionsMenuCellProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Thao tác
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateWorkShiftDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        workShift={workShift}
        onSuccess={() => onSuccess?.()}
      />

      <DeleteWorkShiftDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        workShift={workShift}
        onSuccess={() => onSuccess?.()}
      />
    </>
  );
}
