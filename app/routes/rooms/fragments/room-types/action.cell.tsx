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
import { useState } from "react";
import { UpdateRoomTypeSheet } from "../../components/update-room-types.sheet";

interface RoomTypeActionsCellProps {
  roomType: RoomTypesListItemDto;
}

export function RoomTypeActionsCell({ roomType }: RoomTypeActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);

  return (
    <>
      <Button
        variant={"outline"}
        size="icon"
        onClick={() => setUpdateSheetOpen(true)}
      >
        <Pencil />
      </Button>
      <UpdateRoomTypeSheet
        open={updateSheetOpen}
        onClose={() => setUpdateSheetOpen(false)}
        roomType={roomType}
      />
    </>
  );
}
