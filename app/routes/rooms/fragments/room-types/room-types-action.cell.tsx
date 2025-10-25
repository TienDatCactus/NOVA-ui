import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { UpdateRoomTypeSheet } from "./update-room-types.sheet";
import { useState } from "react";

interface RoomTypeActionsCellProps {
  roomType: RoomTypesListItemDto;
}

export function RoomTypeActionsCell({ roomType }: RoomTypeActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);

  return (
    <>
      <Button
        variant={"gradient"}
        className="w-fit"
        onClick={() => setUpdateSheetOpen(true)}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
      <UpdateRoomTypeSheet
        open={updateSheetOpen}
        onClose={() => setUpdateSheetOpen(false)}
        roomType={roomType}
      />
    </>
  );
}
