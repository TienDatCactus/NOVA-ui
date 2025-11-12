import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO, toDate } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import type z from "zod";
import type { RoomSchema } from "~/services/api/rooms/room.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";

interface ExistingRoomItemCardProps {
  room: z.infer<typeof RoomSchema.BookingDetailRoomItemSchema>;
  roomDetail?: z.infer<typeof RoomSchema.RoomDetailSchema>;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function ExistingRoomItemCard({
  room,
  roomDetail,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: ExistingRoomItemCardProps) {
  const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      return format(parseISO(date), "dd/MM");
    }
    return format(date, "dd/MM");
  };

  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer p-0 hover:border-primary",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div onClick={onSelect} className="p-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm">{room.roomName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {room.roomTypeName} -{" "}
            {formatMoney(roomDetail?.dailyPrice || 0).vndFormatted}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {formatDate(room.fromDate)} → {formatDate(room.toDate)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isExpanded && (
        <CardContent className="pt-0 pb-3">
          <div className="space-y-2 text-xs">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <div className="font-medium">
                  {RoomStatusEnum[
                    roomDetail?.status as keyof typeof RoomStatusEnum
                  ] || "N/A"}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Hạng phòng:</span>
                <div className="font-medium">{room.roomTypeName || "N/A"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
