import { BedDouble, Check, ChevronDown, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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
  const hasAvailableRooms = roomType.availableCount > 0;

  return (
    <Card className="shadow-sm mb-0">
      <CardHeader className="space-y-4">
        {/* Room Type Header */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: Room Type Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {roomType.roomTypeName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {roomType.roomTypeCode}
                </p>
              </div>
            </div>

            {/* Room Specs */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Tối đa {roomType.maxOccupancy} người</span>
              </div>
              <Badge
                variant={hasAvailableRooms ? "success" : "secondary"}
                className="text-xs"
              >
                {hasAvailableRooms
                  ? `${roomType.availableCount} phòng trống`
                  : "Hết phòng"}
              </Badge>
            </div>
          </div>

          {/* Right: Pricing */}
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              {formatMoney(roomType.baseRatePerNight).vndFormatted}
            </p>
            <p className="text-sm text-muted-foreground">/đêm</p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-2xl font-bold text-primary">
                {formatMoney(totalPrice).vndFormatted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tổng {nights} đêm
              </p>
            </div>
          </div>
        </div>

        {/* Selected Rooms Badge */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t">
            <Badge variant="default" className="text-xs font-medium">
              <Check className="h-4 w-4" /> Đã chọn {selectedCount} phòng
            </Badge>
          </div>
        )}
      </CardHeader>

      {/* Collapsible Room List */}
      {roomType.availableRooms.length > 0 && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="border-t bg-muted/30">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
              <span>{isExpanded ? "Ẩn" : "Xem"} danh sách phòng</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {roomType.availableRooms.length} phòng
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-2 py-4">
                {roomType.availableRooms.map((room) => {
                  const isSelected = selectedRoomIds.includes(room.roomId);

                  return (
                    <Label
                      key={room.roomId}
                      htmlFor={room.roomId}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-lg border bg-card p-4 transition-all cursor-pointer",
                        "hover:border-primary/50 hover:shadow-sm",
                        isSelected && "border-primary bg-primary/5 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={room.roomId}
                          checked={isSelected}
                          onCheckedChange={() => onToggleRoom(room.roomId)}
                          className={cn(
                            "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          )}
                        />
                        <div className="grid gap-2">
                          <h1 className="text-xs font-semibold text-muted-foreground">
                            Tên phòng
                          </h1>
                          <p className="text-sm font-medium leading-none">
                            {room.roomName}
                          </p>
                        </div>
                      </div>

                      <Badge variant={"success"} className="text-xs">
                        {"Sẵn sàng"}
                      </Badge>
                    </Label>
                  );
                })}
              </CardContent>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </Card>
  );
}
