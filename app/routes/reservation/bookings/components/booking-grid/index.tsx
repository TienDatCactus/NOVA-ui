import { ArrowUpRightIcon, FolderCode } from "lucide-react";
import type z from "zod";
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
import { RoomSchema } from "~/services/schema/room.schema";
import type { AvailableRoomsInternalResponseDto } from "~/services/api/rooms/dto";
import RoomTypeCard from "../../fragments/room.card";

interface BookingGridProps {
  rooms?: AvailableRoomsInternalResponseDto;
  isLoading?: boolean;
  refetch: () => void;
  onBookNow?: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
}

function BookingGrid({
  rooms = [],
  isLoading = false,
  refetch,
  onBookNow,
  onViewDetails,
}: BookingGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomTypeCard
          key={room.roomTypeId}
          roomType={room}
          onBookNow={onBookNow}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

export default BookingGrid;
