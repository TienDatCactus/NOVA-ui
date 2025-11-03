import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import UpdateRoomSheet from "../../components/update-room.sheet";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import { toast } from "sonner";

interface RoomActionsCellProps {
  room: RoomListItemDto;
}

function RoomActionsCell({ room }: RoomActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canDelete = room.status === "OutOfService";

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
      <Button
        variant={"outline"}
        className="w-fit"
        onClick={() => setUpdateSheetOpen(true)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
      <UpdateRoomSheet
        open={updateSheetOpen}
        onClose={() => setUpdateSheetOpen(false)}
        room={room}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        room={room}
      />
    </>
  );
}

export default RoomActionsCell;
