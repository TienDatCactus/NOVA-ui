import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn, formatMoney } from "~/lib/utils";

import { CHECK_IN_TIME, CHECK_OUT_TIME } from "~/lib/constants";
import {
  RoomAvailabilityStatus,
  RoomAvailabilityStatusColor,
  RoomAvailabilityStatusLabel,
} from "~/services/api/rooms/room.types";
import { createChangeRoomOperation } from "~/services/api/booking/booking.helpers";
import { useUpdateBooking } from "../container/booking-mutation.hooks";
import {
  useAvailableRoomsForChange,
  useBookingDetail,
} from "../container/booking-query.hooks";

export function getRoomAvailabilityLabel(status: string): string {
  return (
    RoomAvailabilityStatusLabel[status as RoomAvailabilityStatus] || status
  );
}

export function getRoomAvailabilityColor(status: string): {
  bg: string;
  text: string;
} {
  return (
    RoomAvailabilityStatusColor[status as RoomAvailabilityStatus] || {
      bg: "bg-gray-100",
      text: "text-gray-600",
    }
  );
}

interface ChangeRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingCode?: string;
}

export default function ChangeRoomDialog({
  open,
  onOpenChange,
  bookingCode,
}: ChangeRoomDialogProps) {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(
    null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { data: bookingDetail } = useBookingDetail({
    bookingCode,
    enabled: open,
  });

  const bookingId = bookingDetail?.id || "";
  const hasMultipleRooms = (bookingDetail?.rooms.length || 0) > 1;
  const currentRoom = bookingDetail?.rooms[currentRoomIndex];
  const { mutate: updateBooking, isPending } = useUpdateBooking(bookingId);

  const { data: availableRoomsData, isLoading: loadingRooms } =
    useAvailableRoomsForChange({
      bookingId,
      bookingRoomId: currentRoom?.bookingRoomId || "",
      enabled: open && !!currentRoom && !!currentRoom.bookingRoomId,
    });

  const availableRooms = availableRoomsData || [];

  // Reset selection when dialog opens or room changes
  useEffect(() => {
    if (open) {
      setSelectedRoomTypeId(null);
      setSelectedRoomId(null);
    }
  }, [open, currentRoomIndex]);

  // Group rooms by room type
  const groupedRooms = availableRooms.reduce(
    (acc, room) => {
      const existing = acc.find((g) => g.roomTypeId === room.roomTypeId);
      if (existing) {
        existing.rooms.push(room);
      } else {
        acc.push({
          roomTypeId: room.roomTypeId,
          roomTypeName: room.roomTypeName,
          rooms: [room],
        });
      }
      return acc;
    },
    [] as Array<{
      roomTypeId: string;
      roomTypeName: string;
      rooms: typeof availableRooms;
    }>
  );

  // Auto-select first room type when data loads
  useEffect(() => {
    if (groupedRooms.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(groupedRooms[0].roomTypeId);
    }
  }, [groupedRooms.length, selectedRoomTypeId]);

  const handleConfirm = () => {
    if (!currentRoom || !selectedRoomId) return;

    // Use createChangeRoomOperation helper to build proper payload
    const changeOperation = createChangeRoomOperation(
      currentRoom.bookingRoomId,
      selectedRoomId
    );

    updateBooking(
      { rooms: [changeOperation] },
      {
        onSuccess: () => {
          toast.success("Đổi phòng thành công");
          onOpenChange(false);
        },
      }
    );
  };

  if (!bookingDetail || !currentRoom) return null;

  // Get selected room type details
  const selectedRoomType = groupedRooms.find(
    (g) => g.roomTypeId === selectedRoomTypeId
  );

  // Get rooms for selected room type
  // Show Available and SwapPossible, hide Occupied
  const roomsForSelectedType =
    selectedRoomType?.rooms.filter(
      (r) =>
        r.availabilityStatus === "Available" ||
        r.availabilityStatus === "SwapPossible"
    ) || [];

  // Get selected room details
  const selectedRoom = availableRooms.find((r) => r.roomId === selectedRoomId);

  const hasChanges = selectedRoomId && selectedRoomId !== currentRoom.roomId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-semibold">
              Đổi phòng
            </DialogTitle>
            {hasMultipleRooms ? (
              <Select
                value={currentRoomIndex.toString()}
                onValueChange={(value) => setCurrentRoomIndex(Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookingDetail?.rooms.map((room, index) => (
                    <SelectItem key={room.roomId} value={index.toString()}>
                      {room.roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-xl font-semibold">
                {currentRoom.roomName}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Date Range Section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Chọn phòng mới</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {format(new Date(bookingDetail.checkinDate), "dd 'Thg' MM")},{" "}
                {CHECK_IN_TIME}
              </span>
              <span>đến</span>
              <span>
                {format(new Date(bookingDetail.checkoutDate), "dd 'Thg' MM")},{" "}
                {CHECK_OUT_TIME}
              </span>
            </div>
          </div>

          {loadingRooms ? (
            <div className="text-center py-12 text-muted-foreground">
              Đang tải...
            </div>
          ) : groupedRooms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Không có phòng trống
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
              {/* Column 1: HẠNG PHÒNG & GIÁ PHÒNG - No scroll */}
              <div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground">
                    HẠNG PHÒNG
                  </h3>
                  <h3 className="text-xs font-semibold text-muted-foreground text-right">
                    GIÁ PHÒNG
                  </h3>
                </div>
                <div className="space-y-2">
                  {groupedRooms.map((roomType) => (
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
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-sm">
                          {roomType.roomTypeName}
                        </span>
                        <span className="font-semibold text-sm whitespace-nowrap">
                          {formatMoney(
                            roomType.rooms[0]?.baseRate || 0
                          ).vndFormatted.replace(" ₫", "")}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Separator Icon */}
              <div className="flex items-center justify-center">
                <div className="flex gap-0.5">
                  <ChevronRight
                    className="w-5 h-5 text-primary"
                    strokeWidth={3}
                  />
                  <ChevronRight
                    className="w-5 h-5 text-primary -ml-3"
                    strokeWidth={3}
                  />
                  <ChevronRight
                    className="w-5 h-5 text-primary -ml-3"
                    strokeWidth={3}
                  />
                </div>
              </div>

              {/* Column 2: PHÒNG - With independent scroll */}
              <div className="flex flex-col max-h-[400px]">
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex-shrink-0">
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
                  <div className="space-y-2 overflow-y-auto pr-2">
                    {roomsForSelectedType.map((room) => {
                      const statusColor = getRoomAvailabilityColor(
                        room.availabilityStatus
                      );
                      const statusLabel = getRoomAvailabilityLabel(
                        room.availabilityStatus
                      );
                      const hasConflict = room.conflictInfo !== null;
                      const isSwapPossible =
                        room.availabilityStatus === "SwapPossible";

                      return (
                        <Card
                          key={room.roomId}
                          className={cn(
                            "p-3 cursor-pointer transition-all hover:border-primary",
                            selectedRoomId === room.roomId &&
                              "border-primary bg-primary/5",
                            isSwapPossible && "border-orange-200"
                          )}
                          onClick={() => setSelectedRoomId(room.roomId)}
                        >
                          <div className="space-y-2">
                            {/* Room name and status */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm">
                                {room.roomName}
                              </span>
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  statusColor.bg,
                                  statusColor.text
                                )}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            {/* Conflict info warning */}
                            {hasConflict &&
                              isSwapPossible &&
                              room.conflictInfo && (
                                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                                  <div className="font-semibold mb-1">
                                    ⚠️ Cần hoán đổi với booking khác
                                  </div>
                                  <div className="space-y-0.5 text-muted-foreground">
                                    <div>
                                      Booking:{" "}
                                      <span className="font-mono">
                                        {room.conflictInfo.bookingCode}
                                      </span>
                                    </div>
                                    {room.conflictInfo.customerName && (
                                      <div>
                                        Khách:{" "}
                                        <span className="font-medium">
                                          {room.conflictInfo.customerName}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-xs italic mt-1">
                                      {room.conflictInfo.message}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
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
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
