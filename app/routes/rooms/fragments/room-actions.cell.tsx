import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import UpdateRoomSheet from "./update-room.sheet";

interface RoomActionsCellProps {
  room: RoomListItemDto;
}

function RoomActionsCell({ room }: RoomActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);

  return (
    <>
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpdateSheetOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa phòng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      <Button
        variant={"gradient"}
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
    </>
  );
}

export default RoomActionsCell;
