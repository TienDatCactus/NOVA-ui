import { MoreHorizontal, Pencil, Trash2, UserX } from "lucide-react";
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
import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import StaffDeleteDialog from "../components/staff-delete-dialog";
import StaffTerminateDialog from "../components/staff-terminate-dialog";
import StaffUpdateDialog from "../components/staff-update-dialog";

interface StaffActionsCellProps {
  staff: StaffListItemDto;
}
export default function StaffActionsCell({ staff }: StaffActionsCellProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const canDelete = staff.status === "Terminated";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        {!canDelete && (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setTerminateDialogOpen(true)}
          >
            <UserX className="mr-2 h-4 w-4" />
            Kết thúc hợp đồng
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa nhân sự
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
      <StaffDeleteDialog
        staff={staff}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      <StaffUpdateDialog
        staff={staff}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
      />
      <StaffTerminateDialog
        staff={staff}
        open={terminateDialogOpen}
        onOpenChange={setTerminateDialogOpen}
      />
    </DropdownMenu>
  );
}
