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
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import EditUnitDialog from "../components/edit-unit.dialog";
import DeleteUnitDialog from "../components/delete-unit.dialog";

interface ActionsMenuCellProps {
  unit: UnitItemDetailResponseDto;
  onSuccess?: () => void;
}

function ActionsMenuCell({ unit, onSuccess }: ActionsMenuCellProps) {
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

      <EditUnitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        unit={unit}
        onSuccess={onSuccess}
      />

      <DeleteUnitDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        unit={unit}
        onSuccess={onSuccess}
      />
    </>
  );
}

export default ActionsMenuCell;
