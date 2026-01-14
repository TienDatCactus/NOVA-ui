import { ChevronDown, DoorOpen, Hash, Minus, Plus, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { cn, formatMoney } from "~/lib/utils";
import { RoomSchema } from "~/services/api/rooms/room.schema";

const { AvailableRoomItemSchema } = RoomSchema;
type AvailableRoomItem = z.infer<typeof AvailableRoomItemSchema>;

interface AvailableRoomRowProps {
  roomType: AvailableRoomItem;
  nights: number;

  // Data props
  selectedRoomIds: string[];
  currentQuantity: number;
  allowExactRoomSelection: boolean;

  // Handlers
  onToggleRoom: (roomId: string) => void;
  onQuantityChange: (quantity: number) => void;
}

export function AvailableRoomRow({
  roomType,
  nights,
  selectedRoomIds,
  currentQuantity,
  allowExactRoomSelection,
  onToggleRoom,
  onQuantityChange,
}: AvailableRoomRowProps) {
  const hasSelection = useMemo(
    () => currentQuantity > 0 || selectedRoomIds.length > 0,
    [currentQuantity, selectedRoomIds.length]
  );

  const [isExpanded, setIsExpanded] = useState(hasSelection);

  const totalPrice = useMemo(
    () => roomType.baseRatePerNight * nights,
    [roomType.baseRatePerNight, nights]
  );
  const hasAvailableRooms = useMemo(
    () => roomType.availableCount > 0,
    [roomType.availableCount]
  );

  // Status visual
  const statusColor = useMemo(
    () =>
      hasSelection
        ? "bg-primary"
        : hasAvailableRooms
          ? "bg-emerald-500/70"
          : "bg-muted-foreground/20",
    [hasSelection, hasAvailableRooms]
  );

  const handleIncrement = useCallback(() => {
    if (currentQuantity < roomType.availableCount) {
      onQuantityChange(currentQuantity + 1);
    }
  }, [currentQuantity, roomType.availableCount, onQuantityChange]);

  const handleDecrement = useCallback(() => {
    if (currentQuantity > 0) {
      onQuantityChange(currentQuantity - 1);
    }
  }, [currentQuantity, onQuantityChange]);

  return (
    <div>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* === HEADER ROW === */}
        <CollapsibleTrigger asChild>
          <div className="relative flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* Status Bar */}
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
                      "text-sm font-bold truncate",
                      !hasAvailableRooms && "text-muted-foreground"
                    )}
                  >
                    {roomType.roomTypeName}
                  </h3>
                  {currentQuantity > 0 && (
                    <Badge
                      variant="default"
                      className="h-5 px-1.5 text-[10px] font-bold animate-in zoom-in"
                    >
                      {currentQuantity}
                    </Badge>
                  )}
                </div>

                {/* Meta Details */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1.5 py-0 h-5 font-normal gap-1"
                  >
                    <Users className="h-3 w-3 opacity-70" />
                    <span>{roomType.maxOccupancy}</span>
                  </Badge>
                  <span className="text-muted-foreground/20">|</span>
                  <span
                    className={cn(
                      "font-medium",
                      hasAvailableRooms
                        ? "text-emerald-600"
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
            <div className="flex items-center justify-between sm:justify-end gap-6 pl-5 sm:pl-0">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">
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
                    ? "bg-background shadow-sm text-foreground ring-1 ring-border"
                    : "text-muted-foreground/50"
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

        {/* === EXPANDED CONTENT: 2 COLS === */}
        <CollapsibleContent>
          <div
            className={cn(
              "grid divide-y md:divide-y-0 md:divide-x border-t bg-background/50",
              allowExactRoomSelection
                ? "grid-cols-1 md:grid-cols-[1fr_250px]"
                : "grid-cols-1"
            )}
          >
            {allowExactRoomSelection && (
              <div className="p-4 pl-9 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <DoorOpen className="h-3.5 w-3.5" />
                  <span>Chọn phòng cụ thể</span>
                </div>

                <ul className="grid ">
                  {roomType.availableRooms.length > 0 ? (
                    roomType.availableRooms.map((room) => {
                      const isSelected = selectedRoomIds.includes(room.roomId);
                      return (
                        <li
                          key={room.roomId}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={room.roomId}
                            checked={isSelected}
                            onCheckedChange={() => onToggleRoom(room.roomId)}
                          />
                          <Label
                            htmlFor={room.roomId}
                            className="cursor-pointer"
                          >
                            {room.roomName}
                          </Label>
                        </li>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-xs text-muted-foreground italic py-2">
                      Không có phòng trống.
                    </p>
                  )}
                </ul>
              </div>
            )}

            {/* COL 2: Quantity Adjustment */}
            <div className="p-4 bg-muted/10 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Hash className="h-3.5 w-3.5" />
                <span>Số lượng</span>
              </div>

              <div className="flex items-center justify-between bg-background border rounded-lg p-1 shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={handleDecrement}
                  disabled={currentQuantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="flex-1 text-center">
                  <span className="text-lg font-bold tabular-nums">
                    {currentQuantity}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  onClick={handleIncrement}
                  disabled={currentQuantity >= roomType.availableCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">
                  Tổng tiền tạm tính:
                </p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {formatMoney(totalPrice * currentQuantity).vndFormatted}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
