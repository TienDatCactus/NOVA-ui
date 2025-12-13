import { Check, ChevronDown, DoorOpen, Users } from "lucide-react";
import { useState } from "react";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
  const selectedInThisType = roomType.availableRooms.filter((r) =>
    selectedRoomIds.includes(r.roomId)
  );

  const selectedCount = selectedInThisType.length;
  const hasSelection = selectedCount > 0;

  const [isExpanded, setIsExpanded] = useState(hasSelection);

  // Derived Data
  const totalPrice = roomType.baseRatePerNight * nights;
  const hasAvailableRooms = roomType.availableCount > 0;

  const statusColor = hasSelection
    ? "bg-primary" // Active/Selected
    : hasAvailableRooms
      ? "bg-emerald-500/70" // Available
      : "bg-muted-foreground/20"; // Full/Unavailable

  return (
    <div
      className={cn(
        "group border-b last:border-0 transition-all duration-200",
        isExpanded ? "bg-muted/30" : "bg-transparent hover:bg-muted/20"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="relative flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between select-none">
            <div className="flex items-start gap-4 min-w-0">
              {/* Status Bar: A clean vertical visual anchor */}
              <div
                className={cn(
                  "w-1 self-stretch rounded-full shrink-0 transition-colors duration-300",
                  statusColor
                )}
              />

              <div className="space-y-1.5 min-w-0">
                {/* Title & Badge */}
                <div className="flex items-center gap-2.5">
                  <h3
                    className={cn(
                      "text-sm font-semibold truncate transition-colors",
                      !hasAvailableRooms && "text-muted-foreground"
                    )}
                  >
                    {roomType.roomTypeName}
                  </h3>
                  {selectedCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-5 px-1.5 text-[10px] font-bold animate-in zoom-in spin-in-12"
                    >
                      {selectedCount}
                    </Badge>
                  )}
                </div>

                {/* Meta Details */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-muted/50 px-1.5 py-0.5 rounded-md">
                    <Users className="h-3 w-3 opacity-70" />
                    <span className="font-medium">{roomType.maxOccupancy}</span>
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span
                    className={cn(
                      "font-medium",
                      hasAvailableRooms
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-destructive"
                    )}
                  >
                    {hasAvailableRooms
                      ? `${roomType.availableCount} phòng trống`
                      : "Hết phòng"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Price & Chevron */}
            <div className="flex items-center justify-between sm:justify-end gap-5 ml-5 sm:ml-0">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums tracking-tight">
                  {formatMoney(totalPrice).vndFormatted}
                </p>
                {nights > 1 && (
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {formatMoney(roomType.baseRatePerNight).vndFormatted} / đêm
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
                  isExpanded
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground/50 bg-transparent group-hover:bg-muted"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* === CONTENT: ROOM CHIPS === */}
        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <div className="px-4 pb-4 pt-0 pl-9 sm:pl-9">
            {/* Grid Layout for better alignment on wider screens */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {roomType.availableRooms.length > 0 ? (
                roomType.availableRooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);
                  return (
                    <Button
                      key={room.roomId}
                      type="button"
                      onClick={() => onToggleRoom(room.roomId)}
                      className={cn(
                        "group/chip relative flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200",

                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-md ring-1 ring-primary"
                          : "bg-background border-border/60 text-foreground hover:border-primary/50 hover:bg-secondary/50 hover:shadow-sm"
                      )}
                    >
                      {!isSelected && (
                        <DoorOpen
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-colors"
                          )}
                        />
                      )}
                      <span className="truncate">{room.roomName}</span>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 animate-in zoom-in duration-300" />
                      )}
                    </Button>
                  );
                })
              ) : (
                <div className="col-span-full py-2">
                  <p className="text-xs text-muted-foreground italic opacity-70">
                    Không có phòng trống trong khoảng ngày đã chọn.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
