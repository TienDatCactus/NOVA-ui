import { format } from "date-fns";
import { BedDouble, Clock, Info, Trash2 } from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn, formatMoney } from "~/lib/utils";
import type { RoomSchema } from "~/services/api/rooms/room.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";

interface ExistingRoomItemCardProps {
  room: z.infer<typeof RoomSchema.BookingDetailRoomItemSchema>;
  roomDetail?: z.infer<typeof RoomSchema.RoomDetailSchema>;
  isSelected: boolean;
  onRemove?: () => void;
  canRemove?: boolean;
  removeTooltip?: string;
}

export default function ExistingRoomItemCard({
  room,
  roomDetail,
  isSelected,

  onRemove,
  canRemove,
  removeTooltip,
}: ExistingRoomItemCardProps) {
  return (
    <Collapsible
      className={cn(
        "group relative w-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer",
      )}
    >
      {/* --- Main Header Row --- */}
      <CollapsibleTrigger className="flex items-start justify-between p-3">
        <div className="flex-1 space-y-2">
          {/* Top Line: Name & Price */}
          <div className="flex items-center justify-between pr-2">
            <div className="font-semibold text-sm flex items-center gap-2">
              {room.roomName || room.roomTypeName}
              {!room.roomId && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Chưa assign
                </Badge>
              )}
              {isSelected && (
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <div className="font-mono text-sm font-medium text-primary">
              {
                formatMoney(room.baseRate || roomDetail?.dailyPrice || 0)
                  .vndFormatted
              }
            </div>
          </div>

          {/* Middle Line: Type or Room ID info */}
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <BedDouble className="h-3 w-3" />
            {room.roomId ? (
              <span className="truncate max-w-[150px]">
                {room.roomTypeName}
              </span>
            ) : (
              <span className="truncate max-w-[150px] italic">
                Loại: {room.roomTypeName}
              </span>
            )}
          </div>

          {/* Bottom Line: Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ">
            <Clock className="h-3 w-3" />
            <span className="font-medium text-foreground/80">
              {format(room.checkinDate || "", "dd/MM")}
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span className="font-medium text-foreground/80">
              {format(room.checkoutDate || "", "dd/MM")}
            </span>
          </div>
        </div>
      </CollapsibleTrigger>

      {/* --- Expanded Details --- */}
      <CollapsibleContent className="border-t bg-muted/20 px-3 py-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Detail: Status */}
          <div className="space-y-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Trạng thái
            </span>
            <Badge variant="outline" className="bg-background font-normal">
              {RoomStatusEnum[
                roomDetail?.status as keyof typeof RoomStatusEnum
              ] || "N/A"}
            </Badge>
          </div>

          {/* Detail: Full Type Name */}
          <div className="space-y-1">
            <span className="text-muted-foreground">Hạng phòng chi tiết</span>
            <div
              className="font-medium truncate"
              title={room.roomTypeName || ""}
            >
              {room.roomTypeName || "N/A"}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {onRemove && (
          <div className="mt-3 pt-2 border-t border-dashed flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors",
                        !canRemove && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canRemove) onRemove();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Xóa phòng
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canRemove && removeTooltip && (
                  <TooltipContent side="bottom">
                    <p className="text-xs">{removeTooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
