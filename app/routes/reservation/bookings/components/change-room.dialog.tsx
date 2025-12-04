import { format } from "date-fns";
import {
  ArrowRightLeft,
  BedDouble,
  AlertTriangle,
  Check,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn, formatMoney } from "~/lib/utils";

import { CHECK_IN_TIME, CHECK_OUT_TIME } from "~/lib/constants";
import { createChangeRoomOperation } from "~/services/api/booking/booking.helpers";
import { useUpdateBooking } from "../container/booking-mutation.hooks";
import {
  useAvailableRoomsForChange,
  useBookingDetail,
} from "../container/booking-query.hooks";
import { RoomAvailabilityStatus } from "~/services/api/rooms/room.types";

const getStatusBadgeVariant = (status: string) => {
  switch (status as RoomAvailabilityStatus) {
    case "Available":
      return "default";
    case "SwapPossible":
      return "warning";
    default:
      return "secondary";
  }
};

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
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  const { data: bookingDetail } = useBookingDetail({
    bookingCode,
    enabled: open,
  });

  const bookingId = bookingDetail?.id || "";
  const currentRoom = bookingDetail?.rooms[currentRoomIndex];
  const hasMultipleRooms = (bookingDetail?.rooms.length || 0) > 1;

  const { mutate: updateBooking, isPending } = useUpdateBooking(bookingId);

  const { data: availableRoomsData, isLoading: loadingRooms } =
    useAvailableRoomsForChange({
      bookingId,
      bookingRoomId: currentRoom?.bookingRoomId || "",
      enabled: open && !!currentRoom?.bookingRoomId,
    });

  const availableRooms = availableRoomsData || [];

  // Reset state
  useEffect(() => {
    if (open) {
      setSelectedRoomTypeId(null);
      setSelectedRoomId("");
    }
  }, [open, currentRoomIndex]);

  const groupedRooms = useMemo(() => {
    return availableRooms.reduce(
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
  }, [availableRooms]);

  // Auto-select first type
  useEffect(() => {
    if (groupedRooms.length > 0 && !selectedRoomTypeId) {
      setSelectedRoomTypeId(groupedRooms[0].roomTypeId);
    }
  }, [groupedRooms.length, selectedRoomTypeId]);

  const handleConfirm = () => {
    if (!currentRoom || !selectedRoomId) return;
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

  const selectedRoomType = groupedRooms.find(
    (g) => g.roomTypeId === selectedRoomTypeId
  );

  const roomsForSelectedType =
    selectedRoomType?.rooms.filter(
      (r) =>
        r.availabilityStatus === "Available" ||
        r.availabilityStatus === "SwapPossible"
    ) || [];

  const selectedRoom = availableRooms.find((r) => r.roomId === selectedRoomId);
  const hasChanges = selectedRoomId && selectedRoomId !== currentRoom.roomId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Đổi phòng (Change Room)
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>
                    {format(new Date(bookingDetail.checkinDate), "dd/MM")} -{" "}
                    {format(new Date(bookingDetail.checkoutDate), "dd/MM")}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-foreground">
                    {currentRoom.roomName} ({currentRoom.roomTypeName})
                  </span>
                </div>
              </div>
            </div>

            {hasMultipleRooms && (
              <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm">
                <span className="text-xs font-medium pl-2 text-muted-foreground">
                  Chọn phòng nguồn:
                </span>
                <Select
                  value={currentRoomIndex.toString()}
                  onValueChange={(value) => setCurrentRoomIndex(Number(value))}
                >
                  <SelectTrigger className="w-[140px] h-8 border-none focus:ring-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingDetail.rooms.map((room, index) => (
                      <SelectItem key={room.roomId} value={index.toString()}>
                        {room.roomName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* BODY LAYOUT - MASTER DETAIL */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-muted/5">
          {/* LEFT SIDEBAR: ROOM TYPES */}
          <div className="w-full md:w-1/3 border-r bg-background flex flex-col">
            <div className="p-3 bg-muted/20 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hạng phòng khả dụng
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loadingRooms ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Đang tải dữ liệu...
                  </div>
                ) : groupedRooms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Không có phòng trống
                  </div>
                ) : (
                  groupedRooms.map((type) => {
                    const isSelected = selectedRoomTypeId === type.roomTypeId;
                    return (
                      <button
                        key={type.roomTypeId}
                        onClick={() => {
                          setSelectedRoomTypeId(type.roomTypeId);
                          setSelectedRoomId("");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg text-left text-sm transition-all border",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-sm"
                            : "bg-transparent border-transparent hover:bg-muted"
                        )}
                      >
                        <div className="space-y-1">
                          <div
                            className={cn(
                              "font-medium",
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {type.roomTypeName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <BedDouble className="w-3 h-3" />
                            {type.rooms.length} phòng trống
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold text-xs">
                            {
                              formatMoney(type.rooms[0]?.baseRate || 0)
                                .vndFormatted
                            }
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT CONTENT: ROOMS LIST */}
          <div className="w-full md:w-2/3 flex flex-col bg-muted/5">
            <div className="p-3 bg-muted/20 border-b flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Danh sách phòng
              </span>
              {selectedRoomTypeId && (
                <span className="text-xs text-muted-foreground">
                  Đang chọn:{" "}
                  <span className="font-medium text-foreground">
                    {roomsForSelectedType.length}
                  </span>{" "}
                  phòng
                </span>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {!selectedRoomTypeId ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <BedDouble className="w-12 h-12 mb-2" />
                  <p>Vui lòng chọn hạng phòng bên trái</p>
                </div>
              ) : (
                <RadioGroup
                  value={selectedRoomId}
                  onValueChange={setSelectedRoomId}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {roomsForSelectedType.map((room) => {
                    const isSelected = selectedRoomId === room.roomId;
                    const isSwap = room.availabilityStatus === "SwapPossible";
                    const conflict = room.conflictInfo;

                    return (
                      <div key={room.roomId} className="relative">
                        <RadioGroupItem
                          value={room.roomId}
                          id={room.roomId}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={room.roomId}
                          className={cn(
                            "relative group cursor-pointer rounded-xl border  bg-background block ",
                            isSelected
                              ? "border-primary  "
                              : "border-transparent hover:border-primary/50 shadow-sm",
                            isSwap &&
                              !isSelected &&
                              "border-orange-200 bg-orange-50/10"
                          )}
                        >
                          {/* Header Card */}
                          <div className="p-4 flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-foreground">
                                  {room.roomName}
                                </span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {room.roomTypeName}
                              </div>
                            </div>

                            {isSwap ? (
                              <Badge
                                variant="outline"
                                className="border-orange-200 text-orange-600 bg-orange-50 text-[10px] h-5 px-1.5 gap-1"
                              >
                                <AlertTriangle className="w-3 h-3" /> Swap
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 text-[10px] h-5"
                              >
                                Available
                              </Badge>
                            )}
                          </div>

                          {/* Conflict Context */}
                          {isSwap && conflict && (
                            <div className="px-4 py-2 bg-orange-50/50 border-t border-orange-100 text-xs text-orange-700">
                              <div className="flex items-center gap-1.5 font-medium mb-1">
                                <ArrowRight className="w-3 h-3" />
                                Đổi với: {conflict.bookingCode}
                              </div>
                              <div
                                className="opacity-80 pl-4 truncate"
                                title={conflict.message}
                              >
                                {conflict.customerName
                                  ? `Khách: ${conflict.customerName}`
                                  : conflict.message}
                              </div>
                            </div>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="p-4 border-t bg-background gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || !hasChanges}
            className="min-w-[120px]"
          >
            {isPending ? "Đang xử lý..." : "Xác nhận đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
