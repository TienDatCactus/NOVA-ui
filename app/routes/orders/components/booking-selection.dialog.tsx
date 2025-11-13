import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import {
  Hotel,
  Search,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BookingService } from "~/services/api/booking";
import type {
  BookingDetailResponseDto,
  BookingListResponseDto,
} from "~/services/api/booking/dto";
import { Skeleton } from "~/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useBookings } from "~/routes/reservation/bookings/container/booking-query.hooks";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import type z from "zod";

type BookingSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (
    bookingId: string,
    bookingRoomId: string,
    bookingCode?: string
  ) => void;
};

export default function BookingSelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: BookingSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<
    Map<string, BookingDetailResponseDto>
  >(new Map());
  const [selectedRooms, setSelectedRooms] = useState<Map<string, string>>(
    new Map()
  );

  const { data: bookings, isLoading } = useBookings({});

  const filteredBookings = bookings?.filter(
    (booking: z.infer<typeof BookingSchema.BookingListItemSchema>) => {
      if (booking.status == "CheckedOut" || booking.status === "Cancelled") {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        booking.bookingCode?.toLowerCase().includes(query) ||
        booking.customerName?.toLowerCase().includes(query)
      );
    }
  );

  const handleToggleBooking = async (bookingCode: string) => {
    if (expandedBooking === bookingCode) {
      setExpandedBooking(null);
      return;
    }

    setExpandedBooking(bookingCode);

    if (!bookingDetails.has(bookingCode)) {
      try {
        setIsLoadingDetail(true);
        const bookingDetail = await BookingService.getBookingDetail({
          code: bookingCode,
        });
        setBookingDetails(
          new Map(bookingDetails.set(bookingCode, bookingDetail))
        );

        if (bookingDetail.rooms && bookingDetail.rooms.length > 0) {
          setSelectedRooms(
            new Map(
              selectedRooms.set(
                bookingCode,
                bookingDetail.rooms[0].bookingRoomId
              )
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch booking detail:", error);
        setExpandedBooking(null);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleRoomSelect = (bookingCode: string, bookingRoomId: string) => {
    setSelectedRooms(new Map(selectedRooms.set(bookingCode, bookingRoomId)));
  };

  const handleConfirmBooking = (bookingCode: string) => {
    const bookingDetail = bookingDetails.get(bookingCode);
    const selectedRoomId = selectedRooms.get(bookingCode);

    if (!bookingDetail || !selectedRoomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }

    onSelect(bookingDetail.id, selectedRoomId, bookingCode);
    onOpenChange(false);

    setExpandedBooking(null);
    setSearchQuery("");
  };

  const handleConfirmBookingOnly = (bookingCode: string) => {
    const bookingDetail = bookingDetails.get(bookingCode);

    if (!bookingDetail) {
      toast.error("Không tìm thấy thông tin booking");
      return;
    }

    onSelect(bookingDetail.id, "", bookingCode);
    onOpenChange(false);

    setExpandedBooking(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-fit">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Hotel className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Chọn booking</DialogTitle>
              <DialogDescription>
                Chọn booking để tính vào hóa đơn phòng
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-search">Tìm kiếm</Label>
            <Input
              id="booking-search"
              placeholder="Nhập mã booking hoặc tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAddon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="space-y-2">
            <Label>Booking đang ở (CheckedIn)</Label>
            <ScrollArea
              className="h-fit
             rounded-md border"
            >
              <div className="p-4 space-y-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  filteredBookings.map((booking: any) => {
                    const bookingDetail = bookingDetails.get(
                      booking.bookingCode
                    );
                    const isExpanded = expandedBooking === booking.bookingCode;
                    const selectedRoomId = selectedRooms.get(
                      booking.bookingCode
                    );

                    return (
                      <Collapsible
                        key={booking.bookingCode}
                        open={isExpanded}
                        onOpenChange={() =>
                          handleToggleBooking(booking.bookingCode)
                        }
                      >
                        <div className="rounded-lg border">
                          {/* Booking Header */}
                          <CollapsibleTrigger asChild>
                            <div className="w-full flex items-center gap-3 ">
                              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                                <Hotel className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-sm">
                                    {booking.bookingCode}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {booking.customerName}
                                  </span>
                                  {booking.checkinDate &&
                                    booking.checkoutDate && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(
                                          parseISO(booking.checkinDate),
                                          "dd/MM"
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          parseISO(booking.checkoutDate),
                                          "dd/MM"
                                        )}
                                      </span>
                                    )}
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>

                          {/* Room Selection */}
                          <CollapsibleContent>
                            <div className="border-t p-4 bg-muted/20">
                              {isLoadingDetail && !bookingDetail ? (
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                              ) : bookingDetail &&
                                bookingDetail.rooms.length > 0 ? (
                                <div className="space-y-3">
                                  {/* Create order for entire booking */}
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                      Tạo đơn hàng cho toàn bộ booking
                                    </Label>
                                    <Button
                                      onClick={() =>
                                        handleConfirmBookingOnly(
                                          booking.bookingCode
                                        )
                                      }
                                      className="w-full"
                                      variant="secondary"
                                    >
                                      Tạo đơn cho booking (tất cả{" "}
                                      {bookingDetail.rooms.length} phòng)
                                    </Button>
                                  </div>

                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                      <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                      <span className="bg-muted/20 px-2 text-muted-foreground">
                                        Hoặc chọn phòng cụ thể
                                      </span>
                                    </div>
                                  </div>

                                  {/* Select specific room */}
                                  <Label className="text-sm font-medium">
                                    Chọn phòng ({bookingDetail.rooms.length}{" "}
                                    phòng)
                                  </Label>
                                  <RadioGroup
                                    value={selectedRoomId}
                                    onValueChange={(value) =>
                                      handleRoomSelect(
                                        booking.bookingCode,
                                        value
                                      )
                                    }
                                  >
                                    <div className="space-y-2">
                                      {bookingDetail.rooms.map(
                                        (room, index) => (
                                          <div
                                            key={room.bookingRoomId}
                                            className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50"
                                          >
                                            <RadioGroupItem
                                              value={room.bookingRoomId}
                                              id={`room-${room.bookingRoomId}`}
                                            />
                                            <Label
                                              htmlFor={`room-${room.bookingRoomId}`}
                                              className="flex-1 cursor-pointer"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                  Phòng {room.roomName}
                                                </span>
                                                {index === 0 && (
                                                  <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                  >
                                                    Phòng chính
                                                  </Badge>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-1">
                                                {room.roomTypeName} •{" "}
                                                {format(
                                                  parseISO(room.fromDate),
                                                  "dd/MM"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                  parseISO(room.toDate),
                                                  "dd/MM"
                                                )}
                                              </div>
                                            </Label>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </RadioGroup>
                                  <Button
                                    onClick={() =>
                                      handleConfirmBooking(booking.bookingCode)
                                    }
                                    className="w-full mt-2"
                                    disabled={!selectedRoomId}
                                  >
                                    Tạo đơn hàng cho phòng đã chọn
                                  </Button>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Booking này không có phòng nào
                                </p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })
                ) : (
                  // Empty state
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Hotel className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="font-medium text-sm">
                      {searchQuery
                        ? "Không tìm thấy booking"
                        : "Không có booking CheckedIn"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery
                        ? "Thử tìm kiếm với từ khóa khác"
                        : "Hiện tại không có khách đang ở"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
