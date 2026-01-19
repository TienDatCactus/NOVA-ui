import { format, parseISO } from "date-fns";
import {
  ArrowLeftRight,
  ArrowUpCircle,
  DoorOpen,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { formatMoney } from "~/lib/utils";
import {
  createAddRoomOperation,
  createRemoveRoomOperation,
} from "~/services/api/booking/booking.helpers";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import {
  canUpgradeRoom,
  type BookingState,
} from "../container/use-booking-state.hooks";
import ExistingRoomItemWrapper from "../fragments/existing-room-item-wrapper";
import NewRoomItemWrapper from "../fragments/new-room-item-wrapper";
import { AddRoomModal } from "./operations/add-room-modal";
import { ChangeRoomTypeDialog } from "./operations/change-room-type-dialog";
import { UpgradeRoomDialog } from "./operations/upgrade-room-dialog";

interface BookingRoomsBarProps {
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  roomsFieldArray: UseFieldArrayReturn<
    StaffUpdateBookingRequestDto,
    "rooms",
    "id"
  >;
  bookingState: BookingState;
  onPreAssignRooms: () => void;
}

export default function BookingRoomsBar({
  bookingDetail,
  form,
  roomsFieldArray,
  bookingState,
  onPreAssignRooms,
}: BookingRoomsBarProps) {
  const { fields, remove, append } = roomsFieldArray;
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [upgradeRoomOpen, setUpgradeRoomOpen] = useState(false);
  const [changeRoomTypeOpen, setChangeRoomTypeOpen] = useState(false);
  const [removeRoomConfirmOpen, setRemoveRoomConfirmOpen] = useState(false);
  const [roomToRemove, setRoomToRemove] = useState<{
    bookingRoomId: string;
    roomName: string;
  } | null>(null);

  // Helper function to find room by bookingRoomId from either roomsByType or rooms
  const findRoomByBookingRoomId = (bookingRoomId: string) => {
    // First try roomsByType
    if (bookingDetail.roomsByType && bookingDetail.roomsByType.length > 0) {
      for (const roomType of bookingDetail.roomsByType) {
        const room = roomType.rooms?.find(
          (r) => r.bookingRoomId === bookingRoomId,
        );
        if (room) return room;
      }
    }
    // Fallback to flat rooms array
    return bookingDetail.rooms?.find((r) => r.bookingRoomId === bookingRoomId);
  };

  const confirmRemoveRoom = () => {
    if (!roomToRemove) return;

    const currentRooms = form.getValues("rooms") || [];
    const alreadyMarkedForRemoval = currentRooms.some(
      (room) =>
        room.action === "Remove" &&
        room.bookingRoomId === roomToRemove.bookingRoomId,
    );

    if (alreadyMarkedForRemoval) {
      toast.warning("Phòng này đã được đánh dấu để xóa");
      setRemoveRoomConfirmOpen(false);
      setRoomToRemove(null);
      return;
    }

    const removeOperation = createRemoveRoomOperation(
      roomToRemove.bookingRoomId,
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
      const roomAlreadyInBooking =
        bookingDetail.rooms &&
        bookingDetail.rooms.some((room) => room.roomId === roomId);
      if (roomAlreadyInBooking) {
        toast.warning("Phòng này đã có trong booking");
        return;
      }

      // Check if room is already being added (in pending operations)
      const currentRooms = form.getValues("rooms") || [];
      const roomAlreadyBeingAdded = currentRooms.some(
        (room) => room.action === "Add" && room.roomId === roomId,
      );
      if (roomAlreadyBeingAdded) {
        toast.warning("Phòng này đã được thêm vào danh sách chờ");
        return;
      }

      const checkinDate = form.watch("checkinDate");
      const actualCheckinDate =
        new Date() > checkinDate! ? new Date() : checkinDate;
      const checkoutDate = form.watch("checkoutDate");

      // Validate dates exist
      if (!checkinDate || !checkoutDate) {
        toast.error("Vui lòng kiểm tra lại ngày checkin/checkout");
        return;
      }

      const isCheckIn = bookingDetail.status === "InHouse";

      const fromDate =
        actualCheckinDate instanceof Date
          ? format(actualCheckinDate, "yyyy-MM-dd")
          : typeof actualCheckinDate === "string"
            ? actualCheckinDate
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

      if (isCheckIn) {
        const today = new Date();
        const checkout =
          checkoutDate instanceof Date ? checkoutDate : parseISO(checkoutDate);
        if (today >= checkout) {
          toast.error(
            "Không thể thêm phòng: Booking sắp checkout (không còn đêm nào)",
          );
          return;
        }
      }

      const operation = createAddRoomOperation(roomId, fromDate, toDate);
      append(operation);
      toast.success("Đã thêm phòng mới");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Thêm phòng thất bại",
      );
    }
  };
  return (
    <>
      <Card className="shadow-sm hover:border-primary bg-background flex flex-col w-96">
        <CardHeader className="text-card-foreground ">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base  font-medium uppercase">
              Danh sách phòng
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={
                    hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
                    !bookingState.permissions.canEditRooms
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Pre-assign rooms - only for Pending/Confirmed status */}
                {(bookingDetail.status === "Pending" ||
                  bookingDetail.status === "Confirmed") && (
                  <DropdownMenuItem onClick={onPreAssignRooms}>
                    <DoorOpen className="w-4 h-4 mr-1" />
                    Pre-assign phòng
                  </DropdownMenuItem>
                )}
                {canUpgradeRoom(bookingDetail?.status) && (
                  <DropdownMenuItem onClick={() => setUpgradeRoomOpen(true)}>
                    <ArrowUpCircle className="w-4 h-4 " />
                    Upgrade phòng
                  </DropdownMenuItem>
                )}
                {/* Change room type - Confirmed or CheckedIn */}
                {(bookingDetail.status === "Confirmed" ||
                  bookingDetail.status === "CheckedIn") && (
                  <DropdownMenuItem onClick={() => setChangeRoomTypeOpen(true)}>
                    <ArrowLeftRight className="w-4 h-4 mr-1" />
                    Đổi loại phòng
                  </DropdownMenuItem>
                )}
                {bookingDetail.status === "CheckedIn" && (
                  <DropdownMenuItem
                    onClick={() => setAddRoomModalOpen(true)}
                    disabled={!bookingState.permissions.canEditRooms}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm phòng
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-4 pb-2">
          {bookingDetail.roomsByType && bookingDetail.roomsByType.length > 0 ? (
            <>
              {bookingDetail.roomsByType.map((roomType) => (
                <div key={roomType.roomTypeId} className="space-y-2">
                  <div className="flex items-center gap-2 px-1 pt-2 first:pt-0">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {roomType.roomTypeName}
                      {roomType.roomCount && roomType.roomCount > 0 && (
                        <span className="ml-1">({roomType.roomCount})</span>
                      )}
                    </span>
                  </div>

                  {/* Rooms in this type */}
                  {roomType.rooms &&
                    roomType.rooms.map((room) => {
                      if (!room.roomId || !room.bookingRoomId) return null;

                      const canRemove =
                        (bookingDetail.status === "Pending" ||
                          bookingDetail.status === "InHouse") &&
                        bookingState.permissions.canEditRooms;

                      return (
                        <div
                          key={room.bookingRoomId}
                          className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                        >
                          {/* Left: Room Info */}
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <DoorOpen className="h-4 w-4" />
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <div className="text-sm font-medium">
                                <span>
                                  {room.roomName || "Chưa có phòng cụ thể"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {room.baseRate && (
                                  <span>
                                    {formatMoney(room.baseRate).vndFormatted}{" "}
                                    ₫/đêm
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          {canRemove && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleRemoveRoom(
                                  room.bookingRoomId!,
                                  room.roomName!,
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}
            </>
          ) : (
            /* Fallback to flat rooms array if roomsByType not available */
            bookingDetail.rooms &&
            bookingDetail.rooms.map((room) => (
              <ExistingRoomItemWrapper
                key={room.roomId}
                room={room}
                isSelected={false}
                onRemove={() =>
                  handleRemoveRoom(room.bookingRoomId, room.roomName)
                }
                canRemove={
                  (bookingDetail.status == "Pending" ||
                    bookingDetail.status == "InHouse") &&
                  bookingState.permissions.canEditRooms
                }
                removeTooltip={
                  !bookingState.permissions.canEditRooms
                    ? bookingState.permissions.blockReason ||
                      "Không thể xóa phòng"
                    : undefined
                }
              />
            ))
          )}
          {/* New Rooms Being Added */}
          {fields.filter(
            (_, index) => form.watch(`rooms.${index}.action`) === "Add",
          ).length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="text-xs font-semibold text-card-foreground mb-2">
                Phòng đang được thêm (
                {
                  fields.filter(
                    (_, index) => form.watch(`rooms.${index}.action`) === "Add",
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
          {fields.filter(
            (_, index) => form.watch(`rooms.${index}.action`) === "Remove",
          ).length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-1 w-1 rounded-full bg-destructive" />
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">
                  Đang chờ xóa (
                  {
                    fields.filter(
                      (_, index) =>
                        form.watch(`rooms.${index}.action`) === "Remove",
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
                    `rooms.${index}.bookingRoomId`,
                  );
                  if (!bookingRoomId) return null;

                  const existingRoom = findRoomByBookingRoomId(bookingRoomId);
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
                            {existingRoom.baseRate && (
                              <>
                                {
                                  formatMoney(existingRoom.baseRate)
                                    .vndFormatted
                                }{" "}
                                ₫/đêm
                              </>
                            )}
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

      <UpgradeRoomDialog
        open={upgradeRoomOpen}
        onOpenChange={setUpgradeRoomOpen}
        bookingDetail={bookingDetail}
      />
      <ChangeRoomTypeDialog
        open={changeRoomTypeOpen}
        onOpenChange={setChangeRoomTypeOpen}
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
