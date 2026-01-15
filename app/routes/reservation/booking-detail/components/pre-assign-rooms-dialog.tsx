import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AlertCircle, Check, DoorOpen } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { usePreAssignRooms } from "../../bookings/container/booking-mutation.hooks";
import { useAvailableRooms } from "../../bookings/container/booking-query.hooks";
import { cn } from "~/lib/utils";

interface PreAssignRoomsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export default function PreAssignRoomsDialog({
  open,
  onOpenChange,
  bookingDetail,
}: PreAssignRoomsDialogProps) {
  const [roomAssignments, setRoomAssignments] = useState<
    Record<string, string>
  >({});

  const { mutate: preAssignRooms, isPending } = usePreAssignRooms(
    bookingDetail.id
  );

  // Fetch available rooms for the booking period
  const { data: availableRoomsData, isPending: isLoadingRooms } =
    useAvailableRooms({
      params: {
        Guests: bookingDetail.adults,
        CheckInDate: bookingDetail.checkinDate,
        CheckOutDate: bookingDetail.checkoutDate,
      },
      enabled: open,
    });

  const roomsByType = useMemo(() => {
    if (!availableRoomsData) return {};

    const grouped: Record<
      string,
      Array<{ roomId: string; roomName: string; status: string }>
    > = {};

    availableRoomsData.forEach((roomTypeGroup) => {
      grouped[roomTypeGroup.roomTypeId] = roomTypeGroup.availableRooms;
    });

    return grouped;
  }, [availableRoomsData]);

  // Initialize assignments with current room assignments
  useState(() => {
    if (bookingDetail.rooms) {
      const initialAssignments: Record<string, string> = {};
      bookingDetail.rooms.forEach((room) => {
        if (room.roomId) {
          initialAssignments[room.bookingRoomId] = room.roomId;
        }
      });
      setRoomAssignments(initialAssignments);
    }
  });

  const handleAssignRoom = (bookingRoomId: string, roomId: string) => {
    setRoomAssignments((prev) => ({
      ...prev,
      [bookingRoomId]: roomId,
    }));
  };

  const handleSubmit = () => {
    // Validate all booking rooms have assignments
    const unassignedRooms = bookingDetail.rooms?.filter(
      (room) => !roomAssignments[room.bookingRoomId]
    );

    if (unassignedRooms && unassignedRooms.length > 0) {
      toast.error(
        `Vui lòng assign tất cả phòng. Còn ${unassignedRooms.length} phòng chưa được assign.`
      );
      return;
    }

    // Check for duplicate room assignments
    const assignedRoomIds = Object.values(roomAssignments);
    const uniqueRoomIds = new Set(assignedRoomIds);
    if (assignedRoomIds.length !== uniqueRoomIds.size) {
      toast.error("Không thể assign cùng một phòng cho nhiều booking room");
      return;
    }

    const payload = {
      roomAssignments: Object.entries(roomAssignments).map(
        ([bookingRoomId, roomId]) => ({
          bookingRoomId,
          roomId,
        })
      ),
    };

    preAssignRooms(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setRoomAssignments({});
      },
    });
  };

  const isFormValid = useMemo(() => {
    if (!bookingDetail.rooms) return false;
    return bookingDetail.rooms.every(
      (room) => roomAssignments[room.bookingRoomId]
    );
  }, [bookingDetail.rooms, roomAssignments]);

  // Check if booking is eligible for pre-assignment
  const canPreAssign =
    bookingDetail.status === "Pending" || bookingDetail.status === "Confirmed";

  if (!canPreAssign) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pre-assign phòng</DialogTitle>
            <DialogDescription>
              Tính năng này chỉ áp dụng cho booking ở trạng thái Pending hoặc
              Confirmed
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Booking hiện tại đang ở trạng thái{" "}
              <span className="font-semibold">{bookingDetail.status}</span>.
              Không thể pre-assign phòng.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pre-assign phòng cụ thể</DialogTitle>
          <DialogDescription>
            Assign phòng cụ thể cho booking trước khi check-in. Phòng phải đúng
            loại đã đặt và available trong khoảng thời gian lưu trú.
          </DialogDescription>
        </DialogHeader>

        {isLoadingRooms ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Đang tải danh sách phòng trống...
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-4">
              {bookingDetail.rooms?.map((bookingRoom, index) => {
                const currentRoomTypeId = bookingRoom.roomTypeId;
                const availableRoomsForType =
                  roomsByType[currentRoomTypeId] || [];
                const currentAssignment =
                  roomAssignments[bookingRoom.bookingRoomId];
                const isCurrentlyAssigned = !!bookingRoom.roomId;

                return (
                  <div key={bookingRoom.bookingRoomId}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold">
                              {bookingRoom.roomTypeName}
                            </h4>
                            {isCurrentlyAssigned && (
                              <Badge variant="outline" className="text-xs">
                                <DoorOpen className="h-3 w-3 mr-1" />
                                {bookingRoom.roomName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bookingDetail.checkinDate} →{" "}
                            {bookingDetail.checkoutDate}
                          </p>
                        </div>
                      </div>

                      {availableRoomsForType.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Không có phòng trống loại{" "}
                            <span className="font-semibold">
                              {bookingRoom.roomTypeName}
                            </span>{" "}
                            trong khoảng thời gian này
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Chọn phòng cụ thể
                          </label>
                          <Select
                            value={currentAssignment || ""}
                            onValueChange={(value) =>
                              handleAssignRoom(bookingRoom.bookingRoomId, value)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full",
                                currentAssignment && "border-primary"
                              )}
                            >
                              <SelectValue placeholder="Chọn phòng..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoomsForType.map((room) => {
                                // Check if this room is already assigned to another booking room
                                const isAssignedToOther = Object.entries(
                                  roomAssignments
                                ).some(
                                  ([bRoomId, rId]) =>
                                    rId === room.roomId &&
                                    bRoomId !== bookingRoom.bookingRoomId
                                );

                                return (
                                  <SelectItem
                                    key={room.roomId}
                                    value={room.roomId}
                                    disabled={isAssignedToOther}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{room.roomName}</span>
                                      {room.roomId === bookingRoom.roomId && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          Hiện tại
                                        </Badge>
                                      )}
                                      {isAssignedToOther && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Đã chọn
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>

                          {currentAssignment && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-green-600" />
                              <span>
                                Phòng đã được chọn:{" "}
                                <span className="font-medium text-foreground">
                                  {
                                    availableRoomsForType.find(
                                      (r) => r.roomId === currentAssignment
                                    )?.roomName
                                  }
                                </span>
                              </span>
                              {currentAssignment !== bookingRoom.roomId && (
                                <Badge variant="secondary" className="text-xs">
                                  Thay đổi
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <div className="text-xs text-muted-foreground flex-1">
            {bookingDetail.rooms && (
              <>
                {Object.keys(roomAssignments).length}/
                {bookingDetail.rooms.length} phòng đã được assign
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isPending || isLoadingRooms}
            >
              {isPending ? "Đang xử lý..." : "Lưu assignment"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
