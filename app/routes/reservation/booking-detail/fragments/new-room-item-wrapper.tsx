import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import NewRoomItemCard from "./new-room-item.card";

interface NewRoomItemWrapperProps {
  roomId: string;
  fromDate: string | Date;
  toDate: string | Date;
  onRemove: () => void;
}

/**
 * Wrapper component that fetches room details from API
 * Connects NewRoomItemCard to room detail query
 */
export default function NewRoomItemWrapper({
  roomId,
  fromDate,
  toDate,
  onRemove,
}: NewRoomItemWrapperProps) {
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
      <Card className="border-dashed border-primary/50 bg-primary/5 p-3">
        <div className="flex gap-3">
          <Skeleton className="w-16 h-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Badge variant="secondary" className="text-xs">
                Mới
              </Badge>
            </div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </Card>
    );
  }

  if (isError || !roomDetail) {
    return (
      <Card className="border-dashed border-primary/50 bg-primary/5 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-destructive">
            Không thể tải thông tin phòng: {roomId}
          </p>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            ✕
          </button>
        </div>
      </Card>
    );
  }

  return (
    <NewRoomItemCard
      roomId={roomDetail.roomId}
      roomName={roomDetail.roomName}
      roomTypeName={roomDetail.roomTypeName}
      imageUrl={roomDetail.imageUrls?.[0]}
      fromDate={fromDate}
      toDate={toDate}
      onRemove={onRemove}
    />
  );
}
