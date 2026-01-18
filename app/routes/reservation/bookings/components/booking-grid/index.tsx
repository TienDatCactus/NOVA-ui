import { Coins, FolderOpen, Users } from "lucide-react";
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
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import RoomCardGrid from "../../../booking-detail/fragments/room.card";
import type { AvailableRoomsWithDetailResponseDto } from "~/services/api/rooms/dto";

interface BookingGridProps {
  rooms?: AvailableRoomsWithDetailResponseDto;
  isLoading?: boolean;
  refetch: () => void;
}

function BookingGrid({
  rooms = [],
  isLoading = false,
  refetch,
}: BookingGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-10">
        {[1, 2].map((section) => (
          <div key={section} className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (rooms.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle className="text-lg">
            Không tìm thấy phòng trống
          </EmptyTitle>
          <EmptyDescription>
            Thử thay đổi ngày check-in/check-out hoặc điều chỉnh bộ lọc tìm
            kiếm.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={refetch} variant="default">
            Tải lại danh sách
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-20">
      {rooms.map((roomType) => (
        <section key={roomType.roomTypeId} className="flex flex-col gap-5">
          {/* --- SECTION HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {roomType.roomTypeName}
                </h2>
                <Badge
                  variant="secondary"
                  className="rounded-full px-2.5 font-normal bg-secondary/50 text-secondary-foreground"
                >
                  {roomType.availableCount} phòng trống
                </Badge>
              </div>

              {/* Meta Info Row - Clean Text */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 opacity-70" />
                  <span>Tối đa {roomType.maxOccupancy} khách</span>
                </div>
                <Separator orientation="vertical" className="h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 opacity-70" />
                  <span>
                    Từ{" "}
                    <span className="font-mono font-medium text-foreground">
                      {formatMoney(roomType.baseRatePerNight).vndFormatted}
                    </span>{" "}
                    / đêm
                  </span>
                </div>
              </div>
            </div>

            {/* Optional: Quick Action or Filter specific to this type */}
            {/* <Button variant="ghost" size="sm" className="hidden md:flex">Xem chi tiết <ArrowRight className="ml-2 h-4 w-4"/></Button> */}
          </div>

          {/* --- GRID CONTENT --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roomType.availableRooms.map((availableRoom) => (
              <RoomCardGrid
                key={availableRoom.roomId}
                roomId={availableRoom.roomId}
              />
            ))}
          </div>

          {/* Divider between sections (except last) */}
          <Separator className="mt-4 bg-border/40 last:hidden" />
        </section>
      ))}
    </div>
  );
}

export default BookingGrid;
