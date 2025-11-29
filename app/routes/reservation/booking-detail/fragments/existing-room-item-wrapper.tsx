import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type z from "zod";
import type { RoomSchema } from "~/services/api/rooms/room.schema";
import ExistingRoomItemCard from "./existing-room-item.card";

interface ExistingRoomItemWrapperProps {
  room: z.infer<typeof RoomSchema.BookingDetailRoomItemSchema>;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
  removeTooltip?: string;
}

export default function ExistingRoomItemWrapper({
  room,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onRemove,
  canRemove = false,
  removeTooltip,
}: ExistingRoomItemWrapperProps) {
  const { data: roomDetail, isPending } = useRoomDetail({
    id: room.roomId,
    params: {},
  });

  if (isExpanded && isPending) {
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
      isExpanded={isExpanded}
      onSelect={onSelect}
      onToggleExpand={onToggleExpand}
      onRemove={onRemove}
      canRemove={canRemove}
      removeTooltip={removeTooltip}
    />
  );
}
