import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";
import RoomItemCard from "./room-item.card";

interface RoomItemWrapperProps {
  roomId: string;
}

/**
 * Wrapper component that fetches room details from API
 * Connects RoomItemCard to room detail query
 */
export default function RoomItemWrapper({ roomId }: RoomItemWrapperProps) {
  const {
    data: roomDetail,
    isLoading,
    isError,
  } = useRoomDetail({
    id: roomId,
    params: {},
  });

  if (isLoading) {
    return (
      <Card className="p-3">
        <div className="flex gap-3">
          <Skeleton className="w-20 h-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  if (isError || !roomDetail) {
    return (
      <Card className="p-3">
        <p className="text-sm text-destructive">
          Không thể tải thông tin phòng: {roomId}
        </p>
      </Card>
    );
  }

  return <RoomItemCard roomDetail={roomDetail} />;
}
