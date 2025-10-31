"use client";

import { addDays, format } from "date-fns";
import { useMemo, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import DateRangePicker from "./components/date-range-picker";
import SelectRoomType from "./components/select-room-types";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import type { DateRange } from "react-day-picker";

interface QuickRoomAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookNow?: (params: {
    from: Date;
    to: Date;
    roomType?: string | null;
  }) => void;
}

export function QuickRoomAvailabilityDialog({
  open,
  onOpenChange,
  onBookNow,
}: QuickRoomAvailabilityDialogProps) {
  const [range, setRange] = useState<DateRange>(() => {
    const today = new Date();
    return { from: today, to: addDays(today, 1) };
  });
  const [roomType, setRoomType] = useState<string>("all");

  const params = useMemo(() => {
    const from = range.from ? format(range.from, "yyyy-MM-dd") : undefined;
    const to = range.to ? format(range.to, "yyyy-MM-dd") : undefined;
    return {
      CheckInDate: from ?? format(new Date(), "yyyy-MM-dd"),
      CheckOutDate: to ?? format(addDays(new Date(), 1), "yyyy-MM-dd"),
      Guests: 2,
    };
  }, [range]);

  const { data: available, isPending } = useAvailableRoomsInternal(params);

  const filteredRooms = useMemo(() => {
    if (!available)
      return [] as Array<{
        roomId: string;
        roomName: string;
        roomTypeName: string;
      }>;
    const items = available.flatMap((rt) =>
      rt.availableRooms.map((r) => ({
        roomId: r.roomId,
        roomName: r.roomName,
        roomTypeName: rt.roomTypeName,
      }))
    );
    if (roomType === "all") return items;
    return items.filter((i) => i.roomTypeName === roomType);
  }, [available, roomType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="">Kiểm tra phòng trống </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn khoảng ngày và loại phòng để xem tình trạng hiện tại.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 grid gap-4 flex-1 max-h-[60vh] overflow-y-auto">
          <DateRangePicker value={range} onChange={setRange} />

          <SelectRoomType value={roomType} onChange={setRoomType} />

          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">Kết quả khả dụng</p>
            <div className="max-h-[300px] overflow-y-auto rounded-lg border p-2">
              {isPending ? (
                <p className="text-sm text-muted-foreground px-2 py-6">
                  Đang tải danh sách phòng trống...
                </p>
              ) : filteredRooms.length === 0 ? (
                <p className="text-sm text-muted-foreground px-2 py-6">
                  Không có phòng trống theo điều kiện đã chọn.
                </p>
              ) : (
                <div className="grid gap-2">
                  {filteredRooms.map((room) => (
                    <Card
                      key={room.roomId}
                      className="flex items-center justify-between p-4 shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium">
                          Phòng {room.roomName}
                          <span className="text-muted-foreground"> · </span>
                          <span className="text-muted-foreground">
                            {room.roomTypeName}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Có thể sử dụng trong khoảng đã chọn
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-600/20">
                        Trống
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              if (range.from && range.to) {
                onBookNow?.({
                  from: range.from,
                  to: range.to,
                  roomType: roomType === "all" ? null : roomType,
                });
              }
              onOpenChange(false);
            }}
          >
            Đặt phòng ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
