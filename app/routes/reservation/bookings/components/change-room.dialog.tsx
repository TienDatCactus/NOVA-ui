import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn, formatMoney } from "~/lib/utils";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { useAvailableRoomsForChange } from "../container/booking-query.hooks";
import { useChangeRoom } from "../container/booking-mutation.hooks";

interface ChangeRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail?: BookingDetailResponseDto;
}

export default function ChangeRoomDialog({
  open,
  onOpenChange,
  bookingDetail,
}: ChangeRoomDialogProps) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
    null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const bookingId = bookingDetail?.id || "";
  const currentRoom = bookingDetail?.rooms[0]; // First room for simplicity
  const { mutate: changeRoom, isPending } = useChangeRoom(bookingId);

  const { data: availableRoomsData, isLoading: loadingRooms } =
    useAvailableRoomsForChange({
      bookingId,
      bookingRoomId: currentRoom?.bookingRoomId || "",
      enabled: open && !!currentRoom && !!currentRoom.bookingRoomId,
    });

  const availableRooms = availableRoomsData?.data || [];

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedRoomTypeId(null);
      setSelectedRoomId(null);
    }
  }, [open]);

  // Auto-select first room type when data loads
  useEffect(() => {
    if (availableRooms.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(availableRooms[0].roomTypeId);
    }
  }, [availableRooms, selectedRoomTypeId]);

  const handleConfirm = () => {
    if (!currentRoom || !selectedRoomId) return;

    const payload = {
      rooms: [
        {
          bookingRoomId: currentRoom.bookingRoomId,
          newRoomId: selectedRoomId,
        },
      ],
    };

    changeRoom(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!bookingDetail || !currentRoom) return null;

  // Get selected room type details
  const selectedRoomType = availableRooms.find(
    (rt) => rt.roomTypeId === selectedRoomTypeId
  );

  // Get rooms for selected room type
  const roomsForSelectedType = selectedRoomType?.rooms || [];

  // Get selected room details
  const selectedRoom = availableRooms
    .flatMap((rt) => rt.rooms)
    .find((r) => r.roomId === selectedRoomId);

  const hasChanges = selectedRoomId && selectedRoomId !== currentRoom.roomId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Đổi phòng {currentRoom.roomName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Date Range Section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Chọn phòng mới</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {format(new Date(bookingDetail.checkinDate), "dd 'Thg' MM, HH:mm")}
              </span>
              <span>đến</span>
              <span>
                {format(new Date(bookingDetail.checkoutDate), "dd 'Thg' MM, HH:mm")}
              </span>
            </div>
          </div>

          {loadingRooms ? (
            <div className="text-center py-12 text-muted-foreground">
              Đang tải...
            </div>
          ) : availableRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Không có phòng trống
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto_1fr_1fr] gap-4">
              {/* Column 1: HẠNG PHÒNG */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">
                  HẠNG PHÒNG
                </h3>
                <div className="space-y-2">
                  {availableRooms.map((roomType) => (
                    <Card
                      key={roomType.roomTypeId}
                      className={cn(
                        "p-3 cursor-pointer transition-all hover:border-primary",
                        selectedRoomTypeId === roomType.roomTypeId &&
                          "border-primary bg-primary/5"
                      )}
                      onClick={() => {
                        setSelectedRoomTypeId(roomType.roomTypeId);
                        setSelectedRoomId(null); // Reset room selection
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-sm">
                          {roomType.roomTypeName}
                        </span>
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {formatMoney(roomType.rooms[0]?.currentPrice || 0)
                            .vndFormatted.replace(" ₫", "")}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Separator Icon */}
              <div className="flex items-center justify-center pt-8">
                <ChevronRight className="w-6 h-6 text-primary" strokeWidth={3} />
              </div>

              {/* Column 2: PHÒNG */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">
                  PHÒNG
                </h3>
                {!selectedRoomTypeId ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Chọn hạng phòng
                  </div>
                ) : roomsForSelectedType.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Không có phòng trống
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roomsForSelectedType.map((room) => (
                      <Card
                        key={room.roomId}
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:border-primary",
                          selectedRoomId === room.roomId &&
                            "border-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedRoomId(room.roomId)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">
                            {room.roomName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {room.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3: KHU VỰC */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3">
                  KHU VỰC
                </h3>
                {!selectedRoom ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Chọn phòng
                  </div>
                ) : (
                  <Card className="p-3">
                    <span className="text-sm font-medium">
                      {selectedRoom.roomName.includes("View") 
                        ? "View hồ"
                        : selectedRoomType?.roomTypeName.includes("VIP")
                        ? "View hồ"
                        : "View hồ"}
                    </span>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Bỏ qua
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !hasChanges}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}