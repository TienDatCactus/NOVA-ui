"use client";

import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatMoney } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface SelectedRoom {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  baseRatePerNight: number;
}

interface SelectedRoomsSummaryProps {
  selectedRooms: SelectedRoom[];
  nights: number;
  onRemoveRoom: (roomId: string) => void;
}

export function SelectedRoomsSummary({
  selectedRooms,
  nights,
  onRemoveRoom,
}: SelectedRoomsSummaryProps) {
  const subtotal = selectedRooms.reduce(
    (sum, room) => sum + room.baseRatePerNight * nights,
    0
  );

  if (selectedRooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phòng đã chọn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa chọn phòng nào
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Phòng đã chọn</CardTitle>
          <Badge variant="secondary">{selectedRooms.length} phòng</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {selectedRooms.map((room) => {
            const roomTotal = room.baseRatePerNight * nights;
            return (
              <div
                key={room.roomId}
                className="flex items-start justify-between gap-2 p-3 rounded-md bg-muted/50 border"
              >
                <div className="flex-1 space-y-1 ">
                  <p className="font-medium text-sm">{room.roomName}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.roomTypeName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(room.baseRatePerNight).vndFormatted} × {nights}{" "}
                    đêm
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onRemoveRoom(room.roomId)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Xóa phòng</span>
                  </Button>
                  <p className="text-sm font-semibold text-primary">
                    {formatMoney(roomTotal).vndFormatted}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Tạm tính ({nights} đêm)
            </span>
            <span className="font-medium">
              {formatMoney(subtotal).vndFormatted}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between font-bold">
            <span>Tổng cộng</span>
            <span className="text-primary text-lg">
              {formatMoney(subtotal).vndFormatted}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          * Chưa bao gồm dịch vụ và bữa sáng
        </p>
      </CardContent>
    </Card>
  );
}
