import { BedDouble, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardHeader } from "~/components/ui/card";
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

interface AvailableRoomTypeCardProps {
  roomType: AvailableRoomItem;
  selectedRoomIds: string[];
  onToggleRoom: (roomId: string) => void;
  nights: number;
}

export function AvailableRoomTypeCard({
  roomType,
  selectedRoomIds,
  onToggleRoom,
  nights,
}: AvailableRoomTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalPrice = roomType.baseRatePerNight * nights;
  const selectedCount = roomType.availableRooms.filter((room) =>
    selectedRoomIds.includes(room.roomId)
  ).length;

  return (
    <Card className="overflow-hidden shadow-s">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{roomType.roomTypeName}</h3>
              <Badge variant="outline" className="text-xs">
                {roomType.roomTypeCode}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Tối đa {roomType.maxOccupancy} người / phòng</span>
              </div>
              <div>
                <Badge
                  variant={
                    roomType.availableCount > 0 ? "success" : "secondary"
                  }
                >
                  {roomType.availableCount > 0
                    ? `${roomType.availableCount} phòng trống`
                    : "Hết phòng"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              {formatMoney(roomType.baseRatePerNight).vndFormatted}/đêm
            </p>
            <p className="text-lg font-bold text-primary">
              {formatMoney(totalPrice).vndFormatted}
            </p>
            <p className="text-xs text-muted-foreground">{nights} đêm</p>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="default" className="text-xs">
              Đã chọn {selectedCount} phòng
            </Badge>
          </div>
        )}
      </CardHeader>

      {roomType.availableRooms.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger>
            <span className="text-muted-foreground text-sm font-medium">
              {isExpanded ? "Ẩn" : "Xem"} danh sách phòng ({roomType.totalRooms}{" "}
              phòng)
            </span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>

          <CollapsibleContent className="px-2 border-t bg-muted/30">
            <div className="space-y-2 py-4">
              {roomType.availableRooms.map(
                (room: AvailableRoomItem["availableRooms"][0]) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);
                  const isAvailable = room.status === "Ready";

                  return (
                    <div className="space-y-2" key={room.roomId}>
                      <Label
                        htmlFor={room.roomId}
                        className={cn(
                          "hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950 ",
                          !isAvailable && "cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleRoom(room.roomId)}
                            disabled={!isAvailable}
                            id={room.roomId}
                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                          />
                          <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">
                              Tên phòng :
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {room.roomName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={isAvailable ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {isAvailable ? "Có sẵn" : "Không khả dụng"}
                        </Badge>
                      </Label>
                    </div>
                  );
                }
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}
