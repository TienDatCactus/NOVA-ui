import { Clock, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { format, parseISO, toDate } from "date-fns";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
  onRemove?: () => void;
  canRemove?: boolean;
  removeTooltip?: string;
}

export default function ExistingRoomItemCard({
  room,
  roomDetail,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onRemove,
  canRemove = false,
  removeTooltip,
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
      <CardHeader
        onClick={onSelect}
        className="px-4 py-2 flex items-center justify-between"
      >
        <CardTitle className="flex-1">
          <div className="font-medium text-sm">{room.roomName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {room.roomTypeName} -{" "}
            {formatMoney(roomDetail?.dailyPrice || 0).vndFormatted}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {formatDate(room.fromDate)} → {formatDate(room.toDate)}
          </div>
        </CardTitle>
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
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 px-4 pb-3 space-y-3">
          <div className="space-y-2 text-xs">
            <div className="grid md:grid-cols-3 grid-cols-1 gap-2">
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
              {onRemove && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block">
                      <Button
                        variant="destructive-ghost"
                        size="icon"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove();
                        }}
                        disabled={!canRemove}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canRemove && removeTooltip && (
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{removeTooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
