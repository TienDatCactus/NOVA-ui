import { format } from "date-fns";
import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { createRemoveRoomOperation } from "~/services/api/booking/booking.helpers";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import ExistingRoomItemWrapper from "../fragments/existing-room-item-wrapper";
import NewRoomItemWrapper from "../fragments/new-room-item-wrapper";
import { AddRoomModal } from "./add-room-modal";

interface BookingRoomsBarProps {
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  roomsFieldArray: UseFieldArrayReturn<
    StaffUpdateBookingRequestDto,
    "rooms",
    "id"
  >;
  permissions: {
    canAddRooms: boolean;
    canRemoveRooms: boolean;
    blockReason?: string | null;
  };
}

export default function BookingRoomsBar({
  bookingDetail,
  form,
  roomsFieldArray,
  permissions,
}: BookingRoomsBarProps) {
  const { fields, remove, append } = roomsFieldArray;
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [removeRoomConfirmOpen, setRemoveRoomConfirmOpen] = useState(false);
  const [roomToRemove, setRoomToRemove] = useState<{
    bookingRoomId: string;
    roomName: string;
  } | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const toggleRoomExpand = (roomId: string) => {
    setExpandedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };
  const confirmRemoveRoom = () => {
    if (!roomToRemove) return;

    const currentRooms = form.getValues("rooms") || [];
    const alreadyMarkedForRemoval = currentRooms.some(
      (room) =>
        room.action === "Remove" &&
        room.bookingRoomId === roomToRemove.bookingRoomId
    );

    if (alreadyMarkedForRemoval) {
      toast.warning("Phòng này đã được đánh dấu để xóa");
      setRemoveRoomConfirmOpen(false);
      setRoomToRemove(null);
      return;
    }

    const removeOperation = createRemoveRoomOperation(
      roomToRemove.bookingRoomId
    );
    append(removeOperation);

    toast.success(`Phòng ${roomToRemove.roomName} sẽ bị xóa khi lưu thay đổi`);
    setRemoveRoomConfirmOpen(false);
    setRoomToRemove(null);
  };
  const handleRemoveRoom = (bookingRoomId: string, roomName: string) => {
    setRoomToRemove({ bookingRoomId, roomName });
    setRemoveRoomConfirmOpen(true);
  };

  const handleAddRoom = (roomId: string) => {
    const checkinDate = form.watch("checkinDate");
    const checkoutDate = form.watch("checkoutDate");

    append({
      action: "Add",
      bookingRoomId: null,
      roomId,
      fromDate:
        checkinDate instanceof Date
          ? format(checkinDate, "yyyy-MM-dd")
          : checkinDate?.toString() || format(new Date(), "yyyy-MM-dd"),
      toDate:
        checkoutDate instanceof Date
          ? format(checkoutDate, "yyyy-MM-dd")
          : checkoutDate?.toString() || format(new Date(), "yyyy-MM-dd"),
    });

    toast.success("Đã thêm phòng mới");
  };

  return (
    <>
      <Card className="shadow-sm flex flex-col w-80">
        <CardHeader className="text-card-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium uppercase">
              Danh sách phòng
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddRoomModalOpen(true)}
              disabled={!permissions.canAddRooms}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {/* Existing Rooms */}
          {bookingDetail.rooms.map((room) => (
            <ExistingRoomItemWrapper
              key={room.roomId}
              room={room}
              isSelected={false}
              isExpanded={expandedRooms.has(room.roomId)}
              onSelect={() => toggleRoomExpand(room.roomId)}
              onToggleExpand={() => toggleRoomExpand(room.roomId)}
              onRemove={() =>
                handleRemoveRoom(room.bookingRoomId, room.roomName)
              }
              canRemove={permissions.canRemoveRooms}
              removeTooltip={
                !permissions.canRemoveRooms
                  ? permissions.blockReason || "Không thể xóa phòng"
                  : undefined
              }
            />
          ))}

          {/* New Rooms Being Added */}
          {fields.filter(
            (_, index) => form.watch(`rooms.${index}.action`) === "Add"
          ).length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="text-xs font-semibold text-card-foreground mb-2">
                Phòng đang được thêm (
                {
                  fields.filter(
                    (_, index) => form.watch(`rooms.${index}.action`) === "Add"
                  ).length
                }
                )
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const action = form.watch(`rooms.${index}.action`);
                  if (action !== "Add") return null;

                  const roomId = form.watch(`rooms.${index}.roomId`);
                  const fromDate = form.watch(`rooms.${index}.fromDate`);
                  const toDate = form.watch(`rooms.${index}.toDate`);

                  if (!roomId || !fromDate || !toDate) return null;

                  return (
                    <NewRoomItemWrapper
                      key={field.id}
                      roomId={roomId}
                      fromDate={fromDate}
                      toDate={toDate}
                      onRemove={() => remove(index)}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* Rooms Being Removed */}
          {fields.filter(
            (_, index) => form.watch(`rooms.${index}.action`) === "Remove"
          ).length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="text-xs font-semibold text-destructive mb-2">
                Phòng sẽ bị xóa (
                {
                  fields.filter(
                    (_, index) =>
                      form.watch(`rooms.${index}.action`) === "Remove"
                  ).length
                }
                )
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const action = form.watch(`rooms.${index}.action`);
                  if (action !== "Remove") return null;

                  const bookingRoomId = form.watch(
                    `rooms.${index}.bookingRoomId`
                  );
                  if (!bookingRoomId) return null;

                  const existingRoom = bookingDetail.rooms.find(
                    (r) => r.bookingRoomId === bookingRoomId
                  );
                  if (!existingRoom) return null;

                  return (
                    <Card
                      key={field.id}
                      className="bg-destructive/5 border-destructive/20 p-0"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm line-through text-muted-foreground">
                              {existingRoom.roomName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {existingRoom.roomTypeName}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <RotateCcw /> Hoàn tác
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <AddRoomModal
        open={addRoomModalOpen}
        onOpenChange={setAddRoomModalOpen}
        onAddRoom={handleAddRoom}
        bookingDetail={bookingDetail}
      />
      <AlertDialog
        open={removeRoomConfirmOpen}
        onOpenChange={setRemoveRoomConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng{" "}
              <span className="font-semibold">{roomToRemove?.roomName}</span>?
              <br />
              <br />
              Thao tác này sẽ được áp dụng khi bạn lưu thay đổi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveRoom}>
              Xóa phòng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
