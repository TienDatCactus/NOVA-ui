import { Check, ChevronDown, Users, DoorOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn, formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/api/rooms/room.schema";

const { AvailableRoomItemSchema } = RoomSchema;
type AvailableRoomItem = z.infer<typeof AvailableRoomItemSchema>;

interface AvailableRoomRowProps {
  roomType: AvailableRoomItem;
  selectedRoomIds: string[];
  onToggleRoom: (roomId: string) => void;
  nights: number;
}

export function AvailableRoomRow({
  roomType,
  selectedRoomIds,
  onToggleRoom,
  nights,
}: AvailableRoomRowProps) {
  // Logic: Tự động mở nếu có phòng đang được chọn bên trong
  const hasSelection = roomType.availableRooms.some((r) =>
    selectedRoomIds.includes(r.roomId)
  );
  const [isExpanded, setIsExpanded] = useState(hasSelection);

  // Logic: Auto-remove (Giữ nguyên logic nghiệp vụ của bạn)
  useEffect(() => {
    const unavailableRoomIds = roomType.availableRooms
      .filter((room) => room.status !== "Ready")
      .map((room) => room.roomId);

    const selectedUnavailableRooms = selectedRoomIds.filter((id) =>
      unavailableRoomIds.includes(id)
    );

    if (selectedUnavailableRooms.length > 0) {
      selectedUnavailableRooms.forEach((roomId) => onToggleRoom(roomId));
    }
  }, [roomType.availableRooms, selectedRoomIds, onToggleRoom]);

  const totalPrice = roomType.baseRatePerNight * nights;
  const selectedCount = roomType.availableRooms.filter((room) =>
    selectedRoomIds.includes(room.roomId)
  ).length;
  const hasAvailableRooms = roomType.availableCount > 0;

  return (
    <div
      className={cn(
        "border-b last:border-0 transition-colors duration-200",
        isExpanded ? "bg-muted/30" : "bg-transparent hover:bg-muted/10"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* === TRIGGER ROW: Minimal & Clean === */}
        <CollapsibleTrigger asChild>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer group gap-3">
            {/* Left: Info */}
            <div className="flex items-start gap-3 min-w-0">
              {/* Status Indicator Bar (Thay thế icon to) */}
              <div
                className={cn(
                  "w-1 self-stretch rounded-full shrink-0 transition-colors",
                  selectedCount > 0
                    ? "bg-primary"
                    : hasAvailableRooms
                      ? "bg-muted-foreground/30"
                      : "bg-destructive/30"
                )}
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "text-sm font-semibold truncate",
                      !hasAvailableRooms && "text-muted-foreground"
                    )}
                  >
                    {roomType.roomTypeName}
                  </h3>
                  {selectedCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-5 px-1.5 text-[10px] animate-in zoom-in"
                    >
                      {selectedCount}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {roomType.maxOccupancy}
                  </span>
                  <span>•</span>
                  <span
                    className={cn(
                      hasAvailableRooms
                        ? "text-green-600 font-medium"
                        : "text-destructive"
                    )}
                  >
                    {hasAvailableRooms
                      ? `Còn ${roomType.availableCount}`
                      : "Hết phòng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Price & Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-4 ml-4 sm:ml-0">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {formatMoney(totalPrice).vndFormatted}
                </p>
                {nights > 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatMoney(roomType.baseRatePerNight).vndFormatted}/đêm
                  </p>
                )}
              </div>
              <div className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground bg-transparent group-hover:bg-muted/50 transition-colors">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* === CONTENT: Compact Chip Grid === */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 pl-8 sm:pl-8">
            {/* Sử dụng Flex Wrap thay vì Grid để thích ứng mọi kích thước container */}
            <div className="flex flex-wrap gap-2">
              {roomType.availableRooms.length > 0 ? (
                roomType.availableRooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);
                  const isAvailable = room.status === "Ready";

                  return (
                    <button
                      key={room.roomId}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onToggleRoom(room.roomId)}
                      className={cn(
                        "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 select-none",
                        // Selected State
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-accent",
                        // Disabled State
                        !isAvailable &&
                          "opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-transparent"
                      )}
                    >
                      {/* Check icon hiện ra khi select, tối giản không chiếm chỗ mặc định */}
                      {isSelected ? (
                        <Check className="h-3 w-3 shrink-0 animate-in zoom-in" />
                      ) : (
                        <DoorOpen
                          className={cn(
                            "h-3 w-3 shrink-0 text-muted-foreground/50 group-hover:text-foreground",
                            !isAvailable && "hidden"
                          )}
                        />
                      )}

                      <span>{room.roomName}</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic pl-1">
                  Danh sách phòng trống tạm thời không khả dụng.
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
