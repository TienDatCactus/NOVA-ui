import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import UpdateRoomSheet from "../../components/update-room.sheet";

interface RoomActionsCellProps {
  room: RoomListItemDto;
}

function RoomActionsCell({ room }: RoomActionsCellProps) {
  const [updateSheetOpen, setUpdateSheetOpen] = useState(false);

  return (
    <>
      <Button
        variant={"info-outline"}
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
