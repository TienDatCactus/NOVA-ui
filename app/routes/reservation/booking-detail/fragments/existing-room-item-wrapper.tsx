import type z from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import type { RoomSchema } from "~/services/api/rooms/room.schema";
import ExistingRoomItemCard from "./existing-room-item.card";

interface ExistingRoomItemWrapperProps {
  room: z.infer<typeof RoomSchema.BookingDetailRoomItemSchema>;
  isSelected: boolean;
  onRemove?: () => void;
  canRemove?: boolean;
  removeTooltip?: string;
}

export default function ExistingRoomItemWrapper({
  room,
  isSelected,
  onRemove,
  canRemove,
  removeTooltip,
}: ExistingRoomItemWrapperProps) {
  const { data: roomDetail, isPending } = useRoomDetail({
    id: room.roomId!,
    params: {},
    enabled: !!room.roomId,
  });

  // Only show skeleton if we're actually fetching room details (roomId exists and loading)
  if (isPending && room.roomId) {
    return (
      <Card className="cursor-pointer">
        <div className="p-3">
          <Skeleton className="h-16 w-full" />
        </div>
        <CardContent className="pt-0 pb-3">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <ExistingRoomItemCard
      room={room}
      roomDetail={roomDetail}
      isSelected={isSelected}
      onRemove={onRemove}
      canRemove={canRemove}
      removeTooltip={removeTooltip}
    />
  );
}
