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
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { useState } from "react";
import { UpdateRoomTypeSheet } from "../../components/room-types/update-room-types.sheet";
import DeleteConfirmDialog from "./delete-confirm.dialog";

interface RoomTypeActionsCellProps {
  roomType: RoomTypesListItemDto;
}

export function RoomTypeActionsCell({ roomType }: RoomTypeActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setUpdateSheetOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
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
      <UpdateRoomTypeSheet
        open={updateSheetOpen}
        onClose={() => setUpdateSheetOpen(false)}
        roomType={roomType}
      />
      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        roomType={roomType}
      />
    </>
  );
}
