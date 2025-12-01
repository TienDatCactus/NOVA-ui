import { format } from "date-fns";
import { ArrowLeftRight, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import {
  createAddRoomOperation,
  createRemoveRoomOperation,
} from "~/services/api/booking/booking.helpers";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import ExistingRoomItemWrapper from "../fragments/existing-room-item-wrapper";
import NewRoomItemWrapper from "../fragments/new-room-item-wrapper";
import { AddRoomModal } from "./operations/add-room-modal";
import { Dropdown } from "react-day-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import ChangeRoomDialog from "../../bookings/components/change-room.dialog";

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
  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
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
    try {
      // Check if room already exists in booking
      const roomAlreadyInBooking = bookingDetail.rooms.some(
        (room) => room.roomId === roomId
      );
      if (roomAlreadyInBooking) {
        toast.warning("Phòng này đã có trong booking");
        return;
      }

      // Check if room is already being added (in pending operations)
      const currentRooms = form.getValues("rooms") || [];
      const roomAlreadyBeingAdded = currentRooms.some(
        (room) => room.action === "Add" && room.roomId === roomId
      );
      if (roomAlreadyBeingAdded) {
        toast.warning("Phòng này đã được thêm vào danh sách chờ");
        return;
      }

      const checkinDate = form.watch("checkinDate");
      const checkoutDate = form.watch("checkoutDate");

      // Validate dates exist
      if (!checkinDate || !checkoutDate) {
        toast.error("Vui lòng kiểm tra lại ngày checkin/checkout");
        return;
      }

      // Normalize dates BEFORE passing to helper
      const fromDate =
        checkinDate instanceof Date
          ? format(checkinDate, "yyyy-MM-dd")
          : typeof checkinDate === "string"
            ? checkinDate
            : null;

      const toDate =
        checkoutDate instanceof Date
          ? format(checkoutDate, "yyyy-MM-dd")
          : typeof checkoutDate === "string"
            ? checkoutDate
            : null;

      if (!fromDate || !toDate) {
        toast.error("Định dạng ngày không hợp lệ");
        return;
      }

      // Use helper function with built-in validation
      const operation = createAddRoomOperation(roomId, fromDate, toDate);

      // Append validated operation
      append(operation);
      toast.success("Đã thêm phòng mới");
    } catch (error) {
      console.error("Add room failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Thêm phòng thất bại"
      );
    }
  };

  return (
    <>
      <Card className="shadow-sm flex flex-col w-96">
        <CardHeader className="text-card-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium uppercase">
              Danh sách phòng
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!permissions.canAddRooms}
                >
                  <Plus className="h-4 w-4 mr-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setAddRoomModalOpen(true)}
                  disabled={!permissions.canAddRooms}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm phòng
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setChangeRoomModalOpen(true)}
                  disabled={!permissions.canAddRooms}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1" />
                  Đổi phòng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-4 pb-2">
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
            <div className="mt-4 space-y-3">
              {/* Header nhỏ gọn, không chiếm diện tích */}
              <div className="flex items-center gap-2 px-1">
                <div className="h-1 w-1 rounded-full bg-destructive" />
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                  Đang chờ xóa (
                  {
                    fields.filter(
                      (_, index) =>
                        form.watch(`rooms.${index}.action`) === "Remove"
                    ).length
                  }
                  )
                </span>
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
                    <div
                      key={field.id}
                      className="group flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 transition-all hover:bg-destructive/10"
                    >
                      {/* Left: Info */}
                      <div className="flex items-center gap-3">
                        {/* Icon visual anchor */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/50 text-destructive shadow-sm">
                          <Trash2 className="h-4 w-4" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-destructive line-through decoration-destructive/50 opacity-80">
                            {existingRoom.roomName}
                          </span>
                          <span className="text-[10px] text-destructive/70 uppercase tracking-wide">
                            {existingRoom.roomTypeName}
                          </span>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-background/80 shadow-sm"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Hoàn tác
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <AddRoomModal
        open={addRoomModalOpen}
        onOpenChange={setAddRoomModalOpen}
        onAddRoom={handleAddRoom}
        bookingDetail={bookingDetail}
      />
      <ChangeRoomDialog
        open={changeRoomModalOpen}
        onOpenChange={setChangeRoomModalOpen}
        bookingCode={bookingDetail.bookingCode}
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
