import type { RoomListResponseDto } from "~/services/api/rooms/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { BedDouble } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { RoomListItemDto } from "~/services/api/rooms/dto";

interface RoomsDataTableProps {
  rooms: RoomListResponseDto;
  isLoading?: boolean;
  onAddRoom: () => void;
  onSelectionChange?: (selectedRows: RoomListItemDto[]) => void;
}

function RoomsDataTable({
  rooms,
  isLoading,
  onAddRoom,
  onSelectionChange,
}: RoomsDataTableProps) {
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
          <Button onClick={onAddRoom}>Thêm phòng đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={rooms}
      onSelectionChange={onSelectionChange}
    />
  );
}

export default RoomsDataTable;
