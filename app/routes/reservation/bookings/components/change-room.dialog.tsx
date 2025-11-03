import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type { AvailableRoomsInternalResponseDto } from "~/services/api/rooms/dto";
import { useAvailableRooms } from "../container/booking-query.hooks";
import { useChangeRoom } from "../container/booking-mutation.hooks";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";

interface ChangeRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail?: BookingDetailResponseDto;
}

type RoomChange = {
  bookingRoomId: string;
  oldRoomId: string;
  oldRoomName: string;
  newRoomId: string | null;
};

// Component to display new room name using useRoomDetail
function NewRoomName({ roomId }: { roomId: string | null }) {
  const { data: roomDetail } = useRoomDetail({
    id: roomId || "",
    params: {},
  });

  if (!roomId || !roomDetail) return null;

  return <span>{roomDetail.roomName}</span>;
}

export default function ChangeRoomDialog({
  open,
  onOpenChange,
  bookingDetail,
}: ChangeRoomDialogProps) {
  const [roomChanges, setRoomChanges] = useState<Map<string, RoomChange>>(
    new Map()
  );

  const bookingId = bookingDetail?.id || "";
  const { mutate: changeRoom, isPending } = useChangeRoom(bookingId);

  const { data: availableRooms, isLoading: loadingRooms } = useAvailableRooms({
    checkinDate: bookingDetail?.checkinDate || "",
    checkoutDate: bookingDetail?.checkoutDate || "",
    guests: (bookingDetail?.adults || 1) + (bookingDetail?.children || 0),
    enabled: open && !!bookingDetail,
  });

  useEffect(() => {
    if (bookingDetail && open) {
      const changes = new Map<string, RoomChange>();
      bookingDetail.rooms.forEach((room) => {
        changes.set(room.bookingRoomId, {
          bookingRoomId: room.bookingRoomId,
          oldRoomId: room.roomId,
          oldRoomName: room.roomName,
          newRoomId: null,
        });
      });
      setRoomChanges(changes);
    }
  }, [bookingDetail, open]);

  const handleRoomChange = (bookingRoomId: string, newRoomId: string) => {
    const currentChange = roomChanges.get(bookingRoomId);
    if (!currentChange) return;

    const updatedChange: RoomChange = {
      ...currentChange,
      newRoomId: newRoomId === currentChange.oldRoomId ? null : newRoomId,
    };

    setRoomChanges(new Map(roomChanges.set(bookingRoomId, updatedChange)));
  };

  const handleConfirm = () => {
    if (!bookingDetail) return;

    const roomsToChange = Array.from(roomChanges.values())
      .filter((change) => change.newRoomId !== null)
      .map((change) => ({
        bookingRoomId: change.bookingRoomId,
        newRoomId: change.newRoomId!,
      }));

    // If no changes, just close
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

  const hasChanges = Array.from(roomChanges.values()).some(
    (change) => change.newRoomId !== null
  );

  if (!bookingDetail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đổi phòng</DialogTitle>
          <DialogDescription>
            Chọn phòng mới cho đặt phòng {bookingDetail.bookingCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Info */}
          <Card className="p-4 bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Khách hàng:</span>
                <p className="font-medium">{bookingDetail.customer.fullName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Nhận phòng:</span>
                <p className="font-medium">{bookingDetail.checkinDate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trả phòng:</span>
                <p className="font-medium">{bookingDetail.checkoutDate}</p>
              </div>
            </div>
          </Card>

          <Separator />

          {/* Room Changes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Danh sách phòng</h3>

            {loadingRooms ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải danh sách phòng trống...
              </div>
            ) : !availableRooms || availableRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có phòng trống trong khoảng thời gian này
              </div>
            ) : (
              Array.from(roomChanges.values()).map((change, index) => (
                <Card key={change.oldRoomId} className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Current Room */}
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">
                        Phòng hiện tại #{index + 1}
                      </Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {change.oldRoomName}
                        </Badge>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                    {/* New Room Selector */}
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">
                        Phòng mới
                      </Label>
                      <Select
                        value={change.newRoomId || change.oldRoomId}
                        onValueChange={(value) =>
                          handleRoomChange(change.bookingRoomId, value)
                        }
                      >
                        <SelectTrigger
                          className={cn(change.newRoomId && "border-primary")}
                        >
                          <SelectValue placeholder="Chọn phòng mới" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Current room option */}
                          <SelectItem value={change.oldRoomId}>
                            <div className="flex items-center gap-2">
                              <span>{change.oldRoomName}</span>
                              <span className="text-xs text-muted-foreground">
                                (Giữ nguyên)
                              </span>
                            </div>
                          </SelectItem>

                          {/* Available rooms grouped by room type */}
                          {availableRooms.map(
                            (
                              roomType: AvailableRoomsInternalResponseDto[number]
                            ) => (
                              <SelectGroup key={roomType.roomTypeId}>
                                <SelectLabel>
                                  {roomType.roomTypeName} (
                                  {roomType.availableCount} trống)
                                </SelectLabel>
                                {roomType.availableRooms
                                  .filter(
                                    (r: { roomId: string }) =>
                                      r.roomId !== change.oldRoomId
                                  ) // Exclude current room
                                  .map(
                                    (room: {
                                      roomId: string;
                                      roomName: string;
                                      status: string;
                                    }) => (
                                      <SelectItem
                                        key={room.roomId}
                                        value={room.roomId}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>{room.roomName}</span>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {room.status}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    )
                                  )}
                              </SelectGroup>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Change Indicator */}
                    <div className="w-8 flex-shrink-0">
                      {change.newRoomId && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show change summary */}
                  {change.newRoomId && (
                    <div className="mt-3 rounded-md bg-primary/5 p-2 text-sm">
                      <span className="text-muted-foreground">Thay đổi: </span>
                      <span className="font-medium">
                        {change.oldRoomName} →{" "}
                        <NewRoomName roomId={change.newRoomId} />
                      </span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Summary */}
          {hasChanges && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {
                    Array.from(roomChanges.values()).filter(
                      (c) => c.newRoomId !== null
                    ).length
                  }{" "}
                  phòng sẽ được thay đổi
                </span>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setRoomChanges(new Map());
            }}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !hasChanges}>
            {isPending ? "Đang lưu..." : "Xác nhận đổi phòng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
