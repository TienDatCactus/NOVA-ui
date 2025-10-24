import { useNavigate } from "react-router";
import type z from "zod";
import { Skeleton } from "~/components/ui/skeleton";
import useBookingSchema from "~/services/schema/booking.schema";
import { ArrowUpRightIcon, FolderCode } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreateBookingDialog from "~/features/create-booking";
import RoomCard from "../fragments/room.card";
import useRoomSchema from "~/services/schema/room.schema";
const { RoomListResponseSchema } = useRoomSchema();
type RoomList = z.infer<typeof RoomListResponseSchema>;
interface BookingGridProps {
  rooms?: RoomList;
  isLoading?: boolean;
  refetch: () => void;
}

function BookingGrid({
  rooms = [],
  isLoading = false,
  refetch,
}: BookingGridProps) {
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-32">
              <Skeleton className="h-full w-full" />
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
          <EmptyTitle>Chưa có đặt phòng</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có đặt phòng nào. Hãy bắt đầu bằng cách tạo đơn đặt phòng
            đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => setOpen(true)}>Tạo đơn đặt phòng</Button>
            <CreateBookingDialog open={open} close={() => setOpen(false)} />
            <Button variant="outline" onClick={refetch}>
              Tải lại
            </Button>
          </div>
        </EmptyContent>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
      {rooms.map((room) => (
        <RoomCard key={room.roomId} room={room} />
      ))}
    </div>
  );
}

export default BookingGrid;
