import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import ExistingRoomItemCard from "./existing-room-item.card";

interface ExistingRoomItemWrapperProps {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  fromDate: string | Date;
  toDate: string | Date;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function ExistingRoomItemWrapper({
  roomId,
  roomName,
  roomTypeName,
  fromDate,
  toDate,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: ExistingRoomItemWrapperProps) {
  const { data: roomDetail, isPending } = useRoomDetail({
    id: roomId,
    params: {},
  });

  // Loading state (only show skeleton when expanded and loading)
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
      roomId={roomId}
      roomName={roomName}
      roomTypeName={roomTypeName}
      fromDate={fromDate}
      toDate={toDate}
      status={roomDetail?.status}
      isSelected={isSelected}
      isExpanded={isExpanded}
      onSelect={onSelect}
      onToggleExpand={onToggleExpand}
    />
  );
}
