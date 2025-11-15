import { format } from "date-fns";
import { BedDouble, Plus, Users } from "lucide-react";
import { useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

interface AddRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (roomId: string, roomTypeId: string) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function AddRoomModal({
  open,
  onOpenChange,
  onAddRoom,
  bookingDetail,
}: AddRoomModalProps) {
  const [addingRoomId, setAddingRoomId] = useState<string | null>(null);
  const { data: availableRooms, isPending: isLoading } =
    useAvailableRoomsInternal({
      CheckInDate: bookingDetail?.checkinDate
        ? format(bookingDetail.checkinDate, "yyyy-MM-dd")
        : "",
      CheckOutDate: bookingDetail?.checkoutDate
        ? format(bookingDetail.checkoutDate, "yyyy-MM-dd")
        : "",
      Guests: (bookingDetail?.adults || 1) + (bookingDetail?.children || 0),
    });
  const handleAddRoom = (roomId: string, roomTypeId: string) => {
    setAddingRoomId(roomId);
    onAddRoom(roomId, roomTypeId);
    setAddingRoomId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] shadow-m">
        <DialogHeader>
          <DialogTitle className="text-xl">Thêm phòng</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn phòng khả dụng để thêm vào booking
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : availableRooms && availableRooms.length > 0 ? (
            <div className="space-y-6">
              {availableRooms.map((roomType) => (
                <div key={roomType.roomTypeId} className="space-y-3">
                  {/* Room Type Header */}
                  <div className="flex items-start justify-between pb-2 border-b border-border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground">
                          {roomType.roomTypeName}
                        </h3>
                        <Badge variant="outline" className="text-xs font-mono">
                          {roomType.roomTypeCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" />
                          <span>
                            {
                              formatMoney(roomType.baseRatePerNight)
                                .vndFormatted
                            }
                            /đêm
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          <span>Tối đa {roomType.maxOccupancy} người</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {roomType.availableCount}/{roomType.totalRooms} trống
                    </Badge>
                  </div>

                  {/* Available Rooms List */}
                  <div className="space-y-1.5">
                    {roomType.availableRooms.map((room) => (
                      <div
                        key={room.roomId}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-md",
                          "border border-border bg-card/50",
                          "hover:bg-accent/50 hover:border-accent-foreground/20 transition-colors"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-foreground">
                              {room.roomName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {room.status === "Ready"
                                ? "Sẵn sàng"
                                : room.status}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() =>
                            handleAddRoom(room.roomId, roomType.roomTypeId)
                          }
                          disabled={addingRoomId === room.roomId}
                          size="sm"
                          variant="default"
                        >
                          {addingRoomId === room.roomId ? (
                            "Đang thêm..."
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Thêm
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {roomType !== availableRooms[availableRooms.length - 1] && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-base font-medium text-foreground">
                Không có phòng trống
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Vui lòng thử lại với thời gian khác
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
