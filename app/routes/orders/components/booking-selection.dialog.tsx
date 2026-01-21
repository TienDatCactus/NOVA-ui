import { format, parseISO } from "date-fns";
import {
  BedDouble,
  Calendar,
  ChevronDown,
  ChevronRight,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { useOrderableBookings } from "~/routes/reservation/bookings/container/booking-query.hooks";
import { BookingService } from "~/services/api/booking";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";

type BookingSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (
    bookingId: string,
    bookingRoomId: string,
    bookingCode?: string,
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

  // Cache fetched details to avoid re-fetching
  const [bookingDetails, setBookingDetails] = useState<
    Map<string, BookingDetailResponseDto>
  >(new Map());

  const { data: orderableBookings, isLoading } = useOrderableBookings();

  // Helper filter function
  const filterBookings = (list?: any[]) => {
    if (!list) return [];
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      (b) =>
        b.bookingCode?.toLowerCase().includes(query) ||
        b.customerName?.toLowerCase().includes(query),
    );
  };

  const filteredActive = filterBookings(orderableBookings?.activeBookings);
  const filteredConfirmed = filterBookings(
    orderableBookings?.confirmedBookings,
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
        const detail = await BookingService.getBookingDetail({
          code: bookingCode,
        });
        setBookingDetails(new Map(bookingDetails.set(bookingCode, detail)));
      } catch (error) {
        toast.error("Không thể tải chi tiết booking");
        setExpandedBooking(null);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleSelect = (bookingId: string, roomId: string, code: string) => {
    onSelect(bookingId, roomId, code);
    onOpenChange(false);
    setExpandedBooking(null);
    setSearchQuery("");
  };

  // Internal Component for Rendering List
  const BookingList = ({
    list,
    emptyText,
  }: {
    list: any[];
    emptyText: string;
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center opacity-50">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">
            {searchQuery ? "Không tìm thấy kết quả" : emptyText}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-1">
        {list.map((booking) => {
          const isExpanded = expandedBooking === booking.bookingCode;
          const detail = bookingDetails.get(booking.bookingCode);

          return (
            <Collapsible
              key={booking.bookingCode}
              open={isExpanded}
              onOpenChange={() => handleToggleBooking(booking.bookingCode)}
              className="bg-background border rounded-xl"
            >
              <CollapsibleTrigger
                asChild
                className={cn(
                  "rounded-xl border bg-card m-0",
                  isExpanded
                    ? "ring-2 ring-primary/20 border-primary shadow-md"
                    : "hover:border-primary/50",
                )}
              >
                <div className="flex cursor-pointer items-center justify-between p-4 group">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                        isExpanded
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      )}
                    >
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {booking.customerName}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[10px] h-5 px-1.5"
                        >
                          {booking.bookingCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {booking.checkinDate &&
                            format(parseISO(booking.checkinDate), "dd/MM")}
                          <span className="opacity-50 mx-0.5">→</span>
                          {booking.checkoutDate &&
                            format(parseISO(booking.checkoutDate), "dd/MM")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t bg-muted/5 p-4 space-y-4">
                  {isLoadingDetail && !detail ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  ) : detail ? (
                    <>
                      {/* OPTION 1: Whole Booking */}
                      <button
                        onClick={() =>
                          handleSelect(detail.id, "", detail.bookingCode)
                        }
                        className="w-full flex items-center justify-between rounded-lg border bg-background p-3 text-left hover:bg-accent transition-colors group/all"
                      >
                        <div className="space-y-1">
                          <span className="font-medium text-sm flex items-center gap-2">
                            Gán cho toàn bộ Booking
                            <Badge
                              variant="default"
                              className="text-[10px] h-4"
                            >
                              Recommended
                            </Badge>
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Đơn hàng sẽ được tính chung vào hóa đơn tổng
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/all:text-primary group-hover/all:translate-x-1 transition-all" />
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase bg-transparent">
                          <span className="bg-background px-2 text-muted-foreground font-medium">
                            Hoặc chọn phòng lẻ
                          </span>
                        </div>
                      </div>

                      {/* OPTION 2: Specific Rooms */}
                      <div className="grid grid-cols-1 gap-2">
                        {detail.rooms && detail.rooms.length > 0 ? (
                          detail.rooms.map((room) => (
                            <button
                              key={room.bookingRoomId}
                              onClick={() =>
                                room.bookingRoomId &&
                                handleSelect(
                                  detail.id,
                                  room?.bookingRoomId,
                                  detail.bookingCode,
                                )
                              }
                              className="flex items-center justify-between rounded-lg border bg-background p-3 text-left hover:border-primary hover:shadow-sm transition-all group/room"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground group-hover/room:bg-primary/10 group-hover/room:text-primary">
                                  <BedDouble className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">
                                      Phòng {room.roomName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground border px-1 rounded bg-muted/20">
                                      {room.roomTypeName}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {format(
                                      parseISO(room?.checkinDate || ""),
                                      "dd/MM",
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      parseISO(room?.checkoutDate || ""),
                                      "dd/MM",
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="h-6 w-6 rounded-full border flex items-center justify-center group-hover/room:border-primary group-hover/room:bg-primary group-hover/room:text-white transition-all">
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-center text-xs text-muted-foreground py-2">
                            Không tìm thấy phòng nào.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-sm text-destructive">
                      Không thể tải thông tin.
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <DialogTitle>Chọn Booking</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="px-6 py-4 pb-2">
            <Input
              startAddon={<Search className="h-4 w-4 text-muted-foreground " />}
              placeholder="Tìm theo mã booking hoặc tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pb-2">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="active">
                  Đang ở ({orderableBookings?.activeBookings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Sắp tới ({orderableBookings?.confirmedBookings?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden relative bg-muted/5">
              <TabsContent value="active" className="absolute inset-0 m-0">
                <ScrollArea className="h-full px-6 py-2">
                  <BookingList
                    list={filteredActive}
                    emptyText="Không có khách đang lưu trú"
                  />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="confirmed" className="absolute inset-0 m-0">
                <ScrollArea className="h-full px-6 py-2">
                  <BookingList
                    list={filteredConfirmed}
                    emptyText="Không có booking sắp tới"
                  />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
