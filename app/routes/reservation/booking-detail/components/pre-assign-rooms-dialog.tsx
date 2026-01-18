import { AlertCircle, Check, DoorOpen } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { FormLabel } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { useAvailableRoomsWithDetail } from "~/routes/rooms/container/rooms/query.hooks";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { usePreAssignRooms } from "../../bookings/container/booking-mutation.hooks";

interface RoomAssignmentForm {
  roomAssignments: Array<{
    bookingRoomId: string;
    roomId: string;
  }>;
}

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
  const form = useForm<RoomAssignmentForm>({
    defaultValues: {
      roomAssignments: [],
    },
  });

  const { mutate: preAssignRooms, isPending } = usePreAssignRooms(
    bookingDetail.id,
  );

  // Fetch available rooms for the booking period
  const { data: availableRoomsData, isLoading } = useAvailableRoomsWithDetail({
    Guests: bookingDetail.adults,
    CheckInDate: bookingDetail.checkinDate,
    CheckOutDate: bookingDetail.checkoutDate,
  });

  // Flatten all booking rooms from roomsByType for easy access
  const allBookingRooms = useMemo(() => {
    return (bookingDetail.roomsByType || []).flatMap((roomType) =>
      (roomType.rooms || []).map((room) => ({
        bookingRoomId: room.bookingRoomId!,
        roomTypeId: roomType.roomTypeId!,
        roomTypeName: roomType.roomTypeName!,
        currentRoomId:
          room.roomId !== "00000000-0000-0000-0000-000000000000"
            ? room.roomId
            : null,
        currentRoomName: room.roomName,
        fromDate: room.fromDate,
        toDate: room.toDate,
      })),
    );
  }, [bookingDetail.roomsByType]);

  // Reset form when dialog opens with pre-existing room assignments
  useEffect(() => {
    if (open && allBookingRooms.length > 0) {
      const existingAssignments = allBookingRooms
        .filter((br) => br.currentRoomId)
        .map((br) => ({
          bookingRoomId: br.bookingRoomId,
          roomId: br.currentRoomId!,
        }));
      form.reset({ roomAssignments: existingAssignments });
    }
  }, [open, allBookingRooms, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const assignments = data.roomAssignments;

    // Validate all booking rooms have assignments
    if (assignments.length !== allBookingRooms.length) {
      const missingCount = allBookingRooms.length - assignments.length;
      toast.error(
        `Vui lòng assign tất cả phòng. Còn ${missingCount} phòng chưa được assign.`,
      );
      return;
    }

    // Check for duplicate room assignments
    const assignedRoomIds = assignments.map((a) => a.roomId);
    const uniqueRoomIds = new Set(assignedRoomIds);
    if (assignedRoomIds.length !== uniqueRoomIds.size) {
      toast.error("Không thể assign cùng một phòng cho nhiều booking room");
      return;
    }

    const payload = {
      roomAssignments: assignments,
    };

    preAssignRooms(payload, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset({ roomAssignments: [] });
      },
    });
  });

  const roomAssignments = form.watch("roomAssignments");
  const assignedCount = roomAssignments.length;

  // Helper to get current assignment for a bookingRoomId
  const getAssignmentForRoom = (bookingRoomId: string) => {
    return roomAssignments.find((a) => a.bookingRoomId === bookingRoomId)
      ?.roomId;
  };

  // Helper to update assignment
  const updateAssignment = (bookingRoomId: string, roomId: string) => {
    const current = roomAssignments.filter(
      (a) => a.bookingRoomId !== bookingRoomId,
    );
    if (roomId) {
      form.setValue("roomAssignments", [...current, { bookingRoomId, roomId }]);
    } else {
      form.setValue("roomAssignments", current);
    }
  };
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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pre-assign phòng cụ thể</DialogTitle>
          <DialogDescription>
            Assign phòng cụ thể cho booking trước khi check-in. Phòng phải đúng
            loại đã đặt và available trong khoảng thời gian lưu trú.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Đang tải danh sách phòng trống...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {(bookingDetail.roomsByType || []).map(
                (roomTypeGroup, typeIndex) => {
                  const bookingRoomsForType = allBookingRooms.filter(
                    (br) => br.roomTypeId === roomTypeGroup.roomTypeId,
                  );

                  if (bookingRoomsForType.length === 0) return null;

                  const availableRoomData = availableRoomsData?.find(
                    (rt) => rt.roomTypeId === roomTypeGroup.roomTypeId,
                  );
                  const availableRoomsForType =
                    availableRoomData?.availableRooms || [];

                  return (
                    <div key={roomTypeGroup.roomTypeId}>
                      {typeIndex > 0 && <Separator className="mb-6" />}

                      {/* Room Type Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-semibold">
                                {roomTypeGroup.roomTypeName}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                <DoorOpen className="h-3 w-3 mr-1" />
                                {availableRoomData?.roomTypeCode ||
                                  roomTypeGroup.roomTypeId?.slice(0, 8)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {bookingDetail.checkinDate} →{" "}
                              {bookingDetail.checkoutDate} •{" "}
                              <span className="font-medium">
                                {bookingRoomsForType.length} phòng cần assign
                              </span>
                            </p>
                          </div>
                          <Badge
                            variant={
                              availableRoomsForType.length === 0
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {availableRoomsForType.length} phòng trống
                          </Badge>
                        </div>

                        {availableRoomsForType.length === 0 && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Không có phòng trống loại{" "}
                              <span className="font-semibold">
                                {roomTypeGroup.roomTypeName}
                              </span>{" "}
                              trong khoảng thời gian này
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Individual Booking Room Assignments */}
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        {bookingRoomsForType.map((bookingRoom, roomIndex) => {
                          const currentAssignment = getAssignmentForRoom(
                            bookingRoom.bookingRoomId,
                          );

                          return (
                            <div
                              key={bookingRoom.bookingRoomId}
                              className="space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium">
                                  Phòng #{roomIndex + 1}
                                  {bookingRoom.currentRoomName && (
                                    <span className="text-xs text-muted-foreground font-normal ml-2">
                                      (Hiện tại: {bookingRoom.currentRoomName})
                                    </span>
                                  )}
                                </FormLabel>
                                {currentAssignment && (
                                  <Badge variant="outline" className="text-xs">
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                    Đã chọn
                                  </Badge>
                                )}
                              </div>

                              <Select
                                onValueChange={(value) =>
                                  updateAssignment(
                                    bookingRoom.bookingRoomId,
                                    value,
                                  )
                                }
                                value={currentAssignment || ""}
                                disabled={availableRoomsForType.length === 0}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-full",
                                    currentAssignment &&
                                      "border-primary bg-primary/5",
                                  )}
                                >
                                  <SelectValue placeholder="Chọn phòng..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableRoomsForType.map((room) => {
                                    const isAssignedToOther =
                                      roomAssignments.some(
                                        (a) =>
                                          a.roomId === room.roomId &&
                                          a.bookingRoomId !==
                                            bookingRoom.bookingRoomId,
                                      );

                                    const isCurrentRoom =
                                      room.roomId === bookingRoom.currentRoomId;

                                    return (
                                      <SelectItem
                                        key={room.roomId}
                                        value={room.roomId}
                                        disabled={isAssignedToOther}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {room.roomName}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {room.status}
                                          </Badge>
                                          {isCurrentRoom && (
                                            <Badge
                                              variant="default"
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
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  <span>
                                    Đã chọn:{" "}
                                    <span className="font-medium text-foreground">
                                      {
                                        availableRoomsForType.find(
                                          (r) => r.roomId === currentAssignment,
                                        )?.roomName
                                      }
                                    </span>
                                  </span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            <DialogFooter className="flex-row justify-between sm:justify-between gap-2 mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="secondary">
                  {assignedCount}/{allBookingRooms.length}
                </Badge>
                <span>phòng đã được assign</span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    assignedCount !== allBookingRooms.length ||
                    isPending ||
                    isLoading
                  }
                >
                  {isPending ? "Đang xử lý..." : "Lưu assignment"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
