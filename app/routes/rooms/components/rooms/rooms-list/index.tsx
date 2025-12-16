import { BedDouble } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { RoomListResponseDto } from "~/services/api/rooms/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "react-aria-components";
import { useState } from "react";
import CreateRoomDialog from "../create-room.dialog";
import { hasRole } from "~/lib/auth/bouncer";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";

interface RoomsDataTableProps {
  rooms: RoomListResponseDto;
  isLoading?: boolean;
}

function RoomsDataTable({ rooms, isLoading }: RoomsDataTableProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BedDouble />
          </EmptyMedia>
          <EmptyTitle>Chưa có phòng</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có phòng nào trong hệ thống. Hãy bắt đầu bằng cách thêm
            phòng đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasRole(AuthLoader.getUser(), UserRole.HotelManager) && (
            <Button onClick={() => setOpenCreateDialog(true)}>
              Thêm phòng mới
            </Button>
          )}
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={rooms} />{" "}
      <CreateRoomDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
    </div>
  );
}

export default RoomsDataTable;
