import { Check } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { cn, formatMoney } from "~/lib/utils";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { useAvailableRoomsForChange } from "../container/booking-query.hooks";
import { useChangeRoom } from "../container/booking-mutation.hooks";

interface ChangeRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail?: BookingDetailResponseDto;
}

type RoomChange = {
  bookingRoomId: string;
  oldRoomId: string;
  newRoomId: string | null;
  newRoomPrice: number | null;
};

export default function ChangeRoomDialog({
  open,
  onOpenChange,
  bookingDetail,
}: ChangeRoomDialogProps) {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [roomChanges, setRoomChanges] = useState<Map<string, RoomChange>>(
    new Map()
  );
  const [useOriginalPrice, setUseOriginalPrice] = useState(true);

  const bookingId = bookingDetail?.id || "";
  const currentRoom = bookingDetail?.rooms[currentRoomIndex];
  const { mutate: changeRoom, isPending } = useChangeRoom(bookingId);

   // Debug: Check what fields are available
  useEffect(() => {
    if (currentRoom) {
      console.log("🔍 Current Room Data:", currentRoom);
      console.log("📋 Available fields:", Object.keys(currentRoom));
    }
  }, [currentRoom]);

  const { data: availableRoomsData, isLoading: loadingRooms } =
    useAvailableRoomsForChange({
      bookingId,
      bookingRoomId: currentRoom?.roomId || "",
      enabled: open && !!currentRoom,
    });

  const availableRooms = availableRoomsData?.data || [];

  useEffect(() => {
    if (bookingDetail && open) {
      const changes = new Map<string, RoomChange>();
      bookingDetail.rooms.forEach((room) => {
        changes.set(room.roomId, {
          bookingRoomId: room.roomId,
          oldRoomId: room.roomId,
          newRoomId: null,
          newRoomPrice: null,
        });
      });
      setRoomChanges(changes);
      setCurrentRoomIndex(0);
    }
  }, [bookingDetail, open]);

  const handleRoomChange = (
    bookingRoomId: string,
    newRoomId: string,
    newRoomPrice: number
  ) => {
    const currentChange = roomChanges.get(bookingRoomId);
    if (!currentChange) return;

    const updatedChange: RoomChange = {
      ...currentChange,
      newRoomId,
      newRoomPrice,
    };

    setRoomChanges(new Map(roomChanges.set(bookingRoomId, updatedChange)));
  };

  const handleConfirm = () => {
    if (!bookingDetail) return;

    const roomsToChange = Array.from(roomChanges.values())
      .filter((change) => change.newRoomId && change.newRoomId !== change.oldRoomId)
      .map((change) => ({
        bookingRoomId: change.bookingRoomId,
        newRoomId: change.newRoomId!,
      }));

    if (roomsToChange.length === 0) {
      onOpenChange(false);
      return;
    }

    const payload = {
      rooms: roomsToChange,
    };

    changeRoom(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setRoomChanges(new Map());
      },
    });
  };

  const currentChange = currentRoom
    ? roomChanges.get(currentRoom.roomId)
    : null;
  const hasChanges = Array.from(roomChanges.values()).some(
    (change) => change.newRoomId && change.newRoomId !== change.oldRoomId
  );

  if (!bookingDetail || !currentRoom) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Đổi phòng {currentRoom.roomName}
          </DialogTitle>
          <DialogDescription>
            Chọn phòng mới cho {bookingDetail.customer.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Timeline - Date Range */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {new Date(bookingDetail.checkinDate).toLocaleDateString("vi-VN")}
              </span>
              <span className="text-muted-foreground">14:00</span>
            </div>
            <span className="text-muted-foreground">đến</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {new Date(bookingDetail.checkoutDate).toLocaleDateString("vi-VN")}
              </span>
              <span className="text-muted-foreground">12:00</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Room Types */}
            <div>
              <h3 className="font-semibold mb-3">HẠNG PHÒNG</h3>
              {loadingRooms ? (
                <div className="text-center py-12 text-muted-foreground">
                  Đang tải...
                </div>
              ) : availableRooms.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Không có phòng trống
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRooms.map((roomType) => (
                    <Card
                      key={roomType.roomTypeId}
                      className={cn(
                        "p-4 cursor-pointer hover:border-primary transition-colors",
                        roomType.rooms.some(
                          (r) => r.roomId === currentChange?.newRoomId
                        ) && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{roomType.roomTypeName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Sạch
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatMoney(roomType.rooms[0]?.currentPrice || 0).vndFormatted}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Available Rooms & Area */}
            <div className="space-y-6">
              {/* Rooms List */}
              <div>
                <h3 className="font-semibold mb-3">PHÒNG</h3>
                {loadingRooms ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Đang tải...
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Không có phòng
                  </div>
                ) : (
                  <RadioGroup
                    value={currentChange?.newRoomId || ""}
                    onValueChange={(value) => {
                      const selectedRoom = availableRooms
                        .flatMap((rt) => rt.rooms)
                        .find((r) => r.roomId === value);
                      if (selectedRoom) {
                        handleRoomChange(
                          currentRoom.roomId,
                          value,
                          selectedRoom.currentPrice
                        );
                      }
                    }}
                    className="space-y-2"
                  >
                    {availableRooms.map((roomType) =>
                      roomType.rooms.map((room) => (
                        <Card
                          key={room.roomId}
                          className={cn(
                            "p-4 cursor-pointer hover:border-primary transition-colors",
                            room.roomId === currentChange?.newRoomId &&
                              "border-primary bg-primary/5"
                          )}
                          onClick={() => {
                            handleRoomChange(
                              currentRoom.roomId,
                              room.roomId,
                              room.currentPrice
                            );
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={room.roomId} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{room.roomName}</span>
                                <span className="text-sm px-2 py-0.5 rounded-full bg-muted">
                                  {room.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </RadioGroup>
                )}
              </div>

              {/* Area/Zone */}
              <div>
                <h3 className="font-semibold mb-3">KHU VỰC</h3>
                <div className="space-y-2">
                  {availableRooms.map((roomType) =>
                    roomType.rooms
                      .reduce((acc: string[], room) => {
                        // Extract area from room type or status
                        const area = roomType.roomTypeName.includes("Premium")
                          ? "Premium"
                          : "Standard";
                        if (!acc.includes(area)) acc.push(area);
                        return acc;
                      }, [])
                      .map((area) => (
                        <Card key={area} className="p-3">
                          <span className="font-medium">{area}</span>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Section */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Giá mới</h3>
            <RadioGroup
              value={useOriginalPrice ? "original" : "custom"}
              onValueChange={(value) => setUseOriginalPrice(value === "original")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="original" id="original" />
                <Label htmlFor="original" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Áp dụng giá phòng mới:</span>
                    <span className="font-semibold text-lg">
                      {currentChange?.newRoomPrice
                        ? formatMoney(currentChange.newRoomPrice).vndFormatted
                        : "0 ₫"}{" "}
                      {currentChange?.newRoomPrice &&
                        currentChange.newRoomPrice > 0 && (
                          <span className="text-sm text-green-600">
                            ▲{" "}
                            {formatMoney(
                              Math.abs(currentChange.newRoomPrice - 0)
                            ).vndFormatted}
                          </span>
                        )}
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">
                  Giữ nguyên giá hiện tại:{" "}
                  <span className="font-semibold">
                    {formatMoney(0).vndFormatted}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
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
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
