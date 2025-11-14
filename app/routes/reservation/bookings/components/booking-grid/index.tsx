import { ArrowUpRightIcon, FolderCode } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { AvailableRoomsInternalResponseDto } from "~/services/api/rooms/dto";
import RoomCardGrid from "../../../booking-detail/fragments/room.card";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";

interface BookingGridProps {
  rooms?: AvailableRoomsInternalResponseDto;
  isLoading?: boolean;
  refetch: () => void;
}

function BookingGrid({
  rooms = [],
  isLoading = false,
  refetch,
}: BookingGridProps) {
  const data = {
    roomTypeId: "eda03359-37c8-4ec8-b6a4-8dd1be756d32",
    roomTypeCode: "STD",
    roomTypeName: "Standard",
    baseRatePerNight: 500000,
    maxOccupancy: 3,
    totalRooms: 2,
    availableCount: 1,
    availableRooms: [
      {
        roomId: "22222222-2222-2222-2222-222222222222",
        roomName: "STD-101",
        status: "Ready",
      },
    ],
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-96">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>Không tìm thấy phòng</EmptyTitle>
          <EmptyDescription>
            Không có phòng nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ
            lọc hoặc tải lại.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={refetch}>Tải lại</Button>
          </div>
        </EmptyContent>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Tìm hiểu thêm <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="">
      {rooms.map((room) => (
        <div key={room.roomTypeId} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xl font-semibold">
              <span>{room.roomTypeName}</span>
              <sup> ({room.availableCount})</sup>
            </div>
            <div className="border-b flex-1" />
            <div className="flex items-center gap-2">
              <Badge variant="info">
                <span>Giá 1 đêm: </span>
                <data>{formatMoney(room.baseRatePerNight).vndFormatted}</data>
              </Badge>
              <Badge variant={"warning"}>
                <span>Số người tối đa: </span>
                <data>{room.maxOccupancy}</data>
              </Badge>
            </div>
          </div>
          <div className="grid auto-rows-fr gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {room.availableRooms.map((availableRoom) => (
              <RoomCardGrid
                key={availableRoom.roomId}
                roomId={availableRoom.roomId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookingGrid;
