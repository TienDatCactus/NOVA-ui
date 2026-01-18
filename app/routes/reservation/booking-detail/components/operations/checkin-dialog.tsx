import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns"; // Standardize date formatting
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Loader2,
  LogIn,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form, FormField, FormLabel } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { cn, formatMoney } from "~/lib/utils";

// Types
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  CheckinBookingRequestDto,
} from "~/services/api/booking/dto";
import { useCheckinBooking } from "../../../bookings/container/booking-mutation.hooks";
import { useAvailableRoomsWithDetail } from "~/routes/rooms/container/rooms/query.hooks";

interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

// Internal form state for UI
interface RoomAssignment {
  bookingRoomId: string;
  roomTypeId: string;
  assignedRoomId: string;
}

export function CheckinDialog({
  open,
  onOpenChange,
  bookingDetail,
}: CheckinDialogProps) {
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const { data: availableRooms = [] } = useAvailableRoomsWithDetail(
    {
      CheckInDate: bookingDetail?.checkinDate || "",
      CheckOutDate: bookingDetail?.checkoutDate || "",
      Guests: bookingDetail?.adults || 0,
    },
    open && !!bookingDetail?.checkinDate && !!bookingDetail?.checkoutDate,
  );

  const { mutate: checkin, isPending: isCheckingIn } = useCheckinBooking(
    bookingDetail?.id || "",
  );

  const form = useForm<CheckinBookingRequestDto>({
    resolver: zodResolver(BookingSchema.CheckinBookingRequestSchema),
    defaultValues: {
      actualCheckinTime: new Date(),
      autoAssignRooms: false,
    },
  });

  // Initialize assignments when dialog opens or booking data changes
  useEffect(() => {
    if (!open || !bookingDetail) {
      return;
    }

    // Build assignments from roomsByType if available, otherwise from rooms
    const newAssignments: RoomAssignment[] = [];

    if (bookingDetail.roomsByType && bookingDetail.roomsByType.length > 0) {
      bookingDetail.roomsByType.forEach((typeGroup) => {
        typeGroup.rooms?.forEach((bookingRoom: any) => {
          newAssignments.push({
            bookingRoomId: bookingRoom.bookingRoomId,
            roomTypeId: typeGroup.roomTypeId || "",
            assignedRoomId: bookingRoom.roomId || "",
          });
        });
      });
    } else if (bookingDetail.rooms) {
      bookingDetail.rooms.forEach((bookingRoom) => {
        newAssignments.push({
          bookingRoomId: bookingRoom.bookingRoomId,
          roomTypeId: bookingRoom.roomTypeId,
          assignedRoomId: bookingRoom.roomId || "",
        });
      });
    }

    setAssignments(newAssignments);
  }, [open, bookingDetail]);

  const handleSubmit = (data: CheckinBookingRequestDto) => {
    let payload: CheckinBookingRequestDto;

    if (data.autoAssignRooms) {
      // Auto-assign: backend will assign rooms
      payload = {
        actualCheckinTime: data.actualCheckinTime,
        autoAssignRooms: true,
      };
    } else {
      // Manual: send roomAssignments as Record<bookingRoomId, roomId>
      const roomAssignments: Record<string, string> = {};
      assignments.forEach((assignment) => {
        if (assignment.assignedRoomId) {
          roomAssignments[assignment.bookingRoomId] = assignment.assignedRoomId;
        }
      });

      payload = {
        actualCheckinTime: data.actualCheckinTime,
        roomAssignments,
        autoAssignRooms: false,
      };
    }

    checkin(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setAssignments([]);
      },
    });
  };

  // Memoize used rooms to prevent double booking in the same form
  const autoAssignRooms = form.watch("autoAssignRooms");

  const selectedRoomIds = useMemo(() => {
    return new Set(assignments.map((a) => a.assignedRoomId).filter(Boolean));
  }, [assignments]);

  if (!bookingDetail) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        {/* Header - More prominence */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/10">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl text-primary">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LogIn className="h-5 w-5" />
                </div>
                Check-in Phòng
              </DialogTitle>
              <DialogDescription className="mt-1.5 ml-1">
                Booking:{" "}
                <span className="font-mono font-medium text-foreground">
                  {bookingDetail.bookingCode}
                </span>
              </DialogDescription>
            </div>
            {/* Optional: Add a status badge here if available in bookingDetail */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1">
              <div className="p-6 space-y-6">
                <div className="rounded-xl border bg-muted/30 p-4 flex flex-col md:flex-row gap-6 md:items-end justify-between">
                  {/* <FormField
                    control={form.control}
                    name="actualCheckinTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col flex-1 min-w-[250px]">
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                          Thời gian Check-in
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <CalendarClock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <input
                              type="datetime-local"
                              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/50"
                              value={
                                field.value
                                  ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                  : ""
                              }
                              onChange={(e) => {
                                const d = new Date(e.target.value);
                                if (!isNaN(d.getTime())) field.onChange(d);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* Divider for desktop */}
                  <div className="hidden md:block w-px h-10 bg-border/60 self-center" />

                  {/* Auto Assign Switch */}
                  <div className="flex items-center justify-between gap-4 flex-1">
                    <div className="space-y-1">
                      <FormLabel className="text-base font-medium text-foreground">
                        Tự động gán phòng
                      </FormLabel>
                      <div className="text-xs text-muted-foreground">
                        Hệ thống tự chọn phòng sạch tối ưu nhất
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="autoAssignRooms"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange} // Use field.onChange
                          className="data-[state=checked]:bg-blue-600"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* 2. Room Assignment List */}
                {autoAssignRooms ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-blue-50/50 border-blue-200">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-blue-900">
                      Chế độ tự động đang bật
                    </h3>
                    <p className="text-sm text-blue-700 max-w-sm mt-1">
                      Hệ thống sẽ tự động tìm{" "}
                      <strong>{assignments.length} phòng</strong> trống phù hợp
                      nhất khi bạn nhấn xác nhận.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <BedDouble className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-bold text-foreground">
                        Danh sách phòng ({assignments.length})
                      </Label>
                    </div>

                    {/* Display rooms grouped by type if available */}
                    {bookingDetail.roomsByType &&
                    bookingDetail.roomsByType.length > 0 ? (
                      <div className="space-y-6">
                        {bookingDetail.roomsByType.map((typeGroup) => (
                          <div key={typeGroup.roomTypeId} className="space-y-3">
                            {/* Room Type Header */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                              <BedDouble className="h-4 w-4 text-primary" />
                              <span className="font-bold text-sm text-primary">
                                {typeGroup.roomTypeName}
                              </span>
                              {typeGroup.roomTypeNameEn && (
                                <span className="text-xs text-muted-foreground">
                                  ({typeGroup.roomTypeNameEn})
                                </span>
                              )}
                              <Badge
                                variant="secondary"
                                className="ml-auto text-xs"
                              >
                                {typeGroup.roomCount ||
                                  typeGroup.rooms?.length ||
                                  0}{" "}
                                phòng
                              </Badge>
                            </div>

                            {/* Rooms in this type */}
                            <div className="grid gap-3 pl-2">
                              {typeGroup.rooms?.map((bookingRoom: any) => {
                                const assignmentIndex = assignments.findIndex(
                                  (a) =>
                                    a.bookingRoomId ===
                                    bookingRoom.bookingRoomId,
                                );
                                if (assignmentIndex === -1) return null;

                                return (
                                  <div
                                    key={bookingRoom.bookingRoomId}
                                    className="group relative flex flex-col md:flex-row items-stretch border rounded-xl overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    {/* Left: Info Section */}
                                    <div className="flex-1 p-4 bg-muted/20 border-b md:border-b-0 md:border-r flex flex-col justify-center gap-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-foreground">
                                              {bookingRoom.roomName ||
                                                "Chưa gán phòng"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                                              <CalendarDays className="h-3 w-3" />
                                              <span>
                                                {format(
                                                  new Date(
                                                    bookingRoom?.fromDate || "",
                                                  ),
                                                  "dd/MM",
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                  new Date(
                                                    bookingRoom?.toDate || "",
                                                  ),
                                                  "dd/MM",
                                                )}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] font-normal px-1.5 h-6 bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                            >
                                              {
                                                formatMoney(
                                                  bookingRoom.baseRate,
                                                ).vndFormatted
                                              }
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Center: Connector Arrow (Desktop only) */}
                                    <div className="hidden md:flex items-center justify-center w-8 bg-muted/5 -ml-[1px] z-10">
                                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                                    </div>

                                    {/* Right: Action Section */}
                                    <div className="w-full md:w-[320px] p-4 bg-card flex items-center">
                                      <div className="w-full space-y-1.5">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                          Gán số phòng
                                        </Label>
                                        {(() => {
                                          // Find the matching room type in available rooms
                                          const roomTypeData =
                                            availableRooms.find(
                                              (rt) =>
                                                rt.roomTypeId ===
                                                typeGroup.roomTypeId,
                                            );
                                          const validRooms =
                                            roomTypeData?.availableRooms || [];
                                          const currentValue =
                                            assignments[assignmentIndex]
                                              ?.assignedRoomId || "";

                                          return (
                                            <Select
                                              value={currentValue}
                                              onValueChange={(value) => {
                                                const newAssignments = [
                                                  ...assignments,
                                                ];
                                                newAssignments[
                                                  assignmentIndex
                                                ] = {
                                                  ...newAssignments[
                                                    assignmentIndex
                                                  ],
                                                  assignedRoomId: value,
                                                };
                                                setAssignments(newAssignments);
                                              }}
                                            >
                                              <SelectTrigger
                                                className={cn(
                                                  "h-10 transition-colors",
                                                  !currentValue
                                                    ? "text-muted-foreground border-dashed bg-muted/10 hover:bg-muted/20"
                                                    : "text-foreground font-medium border-primary/50 bg-primary/5",
                                                )}
                                              >
                                                <SelectValue placeholder="-- Chọn phòng trống --">
                                                  <div className="flex items-center gap-2 truncate">
                                                    {currentValue ? (
                                                      <>
                                                        <BedDouble className="h-4 w-4 text-primary" />
                                                        <span>
                                                          {validRooms.find(
                                                            (r) =>
                                                              r.roomId ===
                                                              currentValue,
                                                          )?.roomName ||
                                                            currentValue}
                                                        </span>
                                                      </>
                                                    ) : (
                                                      <span>
                                                        -- Chọn phòng trống --
                                                      </span>
                                                    )}
                                                  </div>
                                                </SelectValue>
                                              </SelectTrigger>
                                              <SelectContent>
                                                {validRooms.length === 0 ? (
                                                  <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                      <BedDouble className="h-4 w-4 opacity-50" />
                                                    </div>
                                                    <span>
                                                      Hết phòng loại này
                                                    </span>
                                                  </div>
                                                ) : (
                                                  validRooms.map((room) => {
                                                    const isSelected =
                                                      selectedRoomIds.has(
                                                        room.roomId,
                                                      ) &&
                                                      currentValue !==
                                                        room.roomId;
                                                    return (
                                                      <SelectItem
                                                        key={room.roomId}
                                                        value={room.roomId}
                                                        disabled={isSelected}
                                                        className="cursor-pointer"
                                                      >
                                                        <div className="flex items-center justify-between w-full min-w-[200px]">
                                                          <span className="font-medium">
                                                            {room.roomName}
                                                          </span>
                                                          <div className="flex items-center gap-2">
                                                            {room.status && (
                                                              <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                  "text-[10px] px-1.5 h-5",
                                                                  room.status ===
                                                                    "Ready" &&
                                                                    "bg-green-50 text-green-700 border-green-200",
                                                                  room.status ===
                                                                    "Dirty" &&
                                                                    "bg-orange-50 text-orange-700 border-orange-200",
                                                                  room.status ===
                                                                    "Cleaning" &&
                                                                    "bg-blue-50 text-blue-700 border-blue-200",
                                                                )}
                                                              >
                                                                {room.status}
                                                              </Badge>
                                                            )}
                                                            {isSelected && (
                                                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                                Đang chọn
                                                              </span>
                                                            )}
                                                            {!isSelected &&
                                                              !room.status && (
                                                                <span className="h-2 w-2 rounded-full bg-green-500 block" />
                                                              )}
                                                          </div>
                                                        </div>
                                                      </SelectItem>
                                                    );
                                                  })
                                                )}
                                              </SelectContent>
                                            </Select>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback: flat room list (legacy support) */
                      <div className="grid gap-3">
                        {bookingDetail.rooms &&
                          bookingDetail.rooms.map((bookingRoom, index) => (
                            <div
                              key={bookingRoom.bookingRoomId}
                              className="group relative flex flex-col md:flex-row items-stretch border rounded-xl overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              {/* Left: Info Section */}
                              <div className="flex-1 p-4 bg-muted/20 border-b md:border-b-0 md:border-r flex flex-col justify-center gap-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-foreground">
                                        {bookingRoom.roomTypeName}
                                      </span>
                                      {/* Using a subtle visual cue for guest count if available, simplified here */}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                                        <CalendarDays className="h-3 w-3" />
                                        <span>
                                          {format(
                                            new Date(bookingRoom.fromDate),
                                            "dd/MM",
                                          )}{" "}
                                          -{" "}
                                          {format(
                                            new Date(bookingRoom.toDate),
                                            "dd/MM",
                                          )}
                                        </span>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] font-normal px-1.5 h-6 bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                      >
                                        {
                                          formatMoney(bookingRoom.baseRate)
                                            .vndFormatted
                                        }
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Center: Connector Arrow (Desktop only) */}
                              <div className="hidden md:flex items-center justify-center w-8 bg-muted/5 -ml-[1px] z-10">
                                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                              </div>

                              {/* Right: Action Section */}
                              <div className="w-full md:w-[320px] p-4 bg-card flex items-center">
                                <div className="w-full space-y-1.5">
                                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Gán số phòng
                                  </Label>
                                  {(() => {
                                    // Find the matching room type in available rooms
                                    const roomTypeData = availableRooms.find(
                                      (rt) =>
                                        rt.roomTypeId ===
                                        bookingRoom.roomTypeId,
                                    );
                                    const validRooms =
                                      roomTypeData?.availableRooms || [];
                                    const currentValue =
                                      assignments[index]?.assignedRoomId || "";

                                    return (
                                      <Select
                                        value={currentValue}
                                        onValueChange={(value) => {
                                          const newAssignments = [
                                            ...assignments,
                                          ];
                                          newAssignments[index] = {
                                            ...newAssignments[index],
                                            assignedRoomId: value,
                                          };
                                          setAssignments(newAssignments);
                                        }}
                                      >
                                        <SelectTrigger
                                          className={cn(
                                            "h-10 transition-colors",
                                            !currentValue
                                              ? "text-muted-foreground border-dashed bg-muted/10 hover:bg-muted/20"
                                              : "text-foreground font-medium border-primary/50 bg-primary/5",
                                          )}
                                        >
                                          <div className="flex items-center gap-2 truncate">
                                            {currentValue ? (
                                              <BedDouble className="h-4 w-4 text-primary" />
                                            ) : null}
                                            <SelectValue placeholder="-- Chọn phòng trống --" />
                                          </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {validRooms.length === 0 ? (
                                            <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center gap-2">
                                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <BedDouble className="h-4 w-4 opacity-50" />
                                              </div>
                                              <span>Hết phòng loại này</span>
                                            </div>
                                          ) : (
                                            validRooms.map((room) => {
                                              const isSelected =
                                                selectedRoomIds.has(
                                                  room.roomId,
                                                ) &&
                                                currentValue !== room.roomId;
                                              return (
                                                <SelectItem
                                                  key={room.roomId}
                                                  value={room.roomId}
                                                  disabled={isSelected}
                                                  className="cursor-pointer"
                                                >
                                                  <div className="flex items-center justify-between w-full min-w-[200px]">
                                                    <span className="font-medium">
                                                      {room.roomName}
                                                    </span>
                                                    {isSelected && (
                                                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        Đang chọn
                                                      </span>
                                                    )}
                                                    {/* Visual sugar: Status dot */}
                                                    {!isSelected && (
                                                      <span className="h-2 w-2 rounded-full bg-green-500 block" />
                                                    )}
                                                  </div>
                                                </SelectItem>
                                              );
                                            })
                                          )}
                                        </SelectContent>
                                      </Select>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isCheckingIn}
                className="text-muted-foreground hover:text-foreground"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isCheckingIn}
                className="min-w-[160px] shadow-lg shadow-primary/20"
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Xác nhận Check-in
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
