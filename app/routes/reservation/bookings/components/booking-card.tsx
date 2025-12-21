import { format, isBefore, isToday, parseISO, startOfDay } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  DoorOpen,
  Globe,
  LogIn,
  LogOut,
  MoreVertical,
  ShieldAlert,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type z from "zod";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { DASHBOARD } from "~/lib/fe-url";
import { cn, formatMoney, useCalculateNights } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
import { useBookingState } from "../../booking-detail/container/use-booking-state.hooks";
import {
  useCancelBooking,
  useUpdateBookingStatus,
} from "../container/booking-mutation.hooks";
import { useBookingDetail } from "../container/booking-query.hooks";
import BookingDetailSheet from "./booking-detail.sheet";

const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;

interface BookingCardProps {
  booking: BookingListItem;
  refetch?: () => void;
}

export function BookingCard({ booking, refetch }: BookingCardProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const { data: bookingDetail } = useBookingDetail({
    bookingId: booking.bookingId,
    enabled: true,
  });

  const bookingState = useBookingState(bookingDetail);
  const { mutateAsync: updateStatus, isPending: isProcessing } =
    useUpdateBookingStatus(booking.bookingId || "");
  const { mutateAsync: cancelBooking } = useCancelBooking(
    booking.bookingId || ""
  );
  const navigate = useNavigate();

  const statusConfig = BOOKING_STATUSES.find((s) => s.value === booking.status);
  const checkinDate = booking.checkinDate
    ? parseISO(booking.checkinDate)
    : null;
  const checkoutDate = booking.checkoutDate
    ? parseISO(booking.checkoutDate)
    : null;

  const isArrivingToday = !!(checkinDate && isToday(checkinDate));

  // --- DIVERSITY LOGIC ---
  const isRoomBlock =
    booking.source === "RoomBlock" || bookingDetail?.source === "RoomBlock";

  const canConfirmPayment = booking.status === "Pending";

  const canCheckIn =
    (isRoomBlock && booking.status === "Confirmed") ||
    (booking.status === "Confirmed" &&
      !!checkinDate &&
      !isBefore(startOfDay(new Date()), startOfDay(checkinDate)));

  const canCheckOut =
    (booking.status === "InHouse" || booking.status === "CheckedIn") &&
    (isRoomBlock || bookingState.financial.totalBalance === 0);

  const canCancel =
    (booking.status === "Pending" || booking.status === "Confirmed") &&
    bookingState.permissions.canEdit &&
    !bookingState.permissions.blockReason;

  const handleCheckIn = async () => {
    if (!canCheckIn && !isRoomBlock) {
      toast.error("Không thể check-in booking này");
      return;
    }
    await updateStatus("CheckedIn");
    if (!isRoomBlock) await updateStatus("InHouse");
    refetch?.();
  };

  const handleCheckOut = async () => {
    if (!canCheckOut) {
      if (!isRoomBlock && bookingState.financial.totalBalance > 0) {
        toast.error(
          `Còn nợ ${formatMoney(bookingState.financial.totalBalance).vndFormatted}`
        );
        return;
      }
      toast.error("Không thể checkout");
      return;
    }

    if (isRoomBlock) {
      await updateStatus("CheckedOut");
      refetch?.();
      toast.success("Đã hoàn tất bảo trì");
    } else {
      navigate(DASHBOARD.bookings.bookingDetail(booking.bookingCode!));
    }
  };

  const handleCancel = async () => {
    if (!canCancel) return;
    try {
      await cancelBooking();
      toast.success(
        isRoomBlock ? "Đã hủy lịch bảo trì" : "Hủy đặt phòng thành công"
      );
      refetch?.();
      setCancelDialogOpen(false);
    } catch {
      toast.error("Thao tác thất bại");
    }
  };

  const nights = useCalculateNights({
    checkinDate: booking.checkinDate,
    checkoutDate: booking.checkoutDate,
  });

  const handleViewDetail = () => {
    navigate(DASHBOARD.bookings.bookingDetail(booking.bookingCode!));
  };

  // --- RENDER HELPERS ---

  const renderStatusBadge = () => {
    if (isRoomBlock) {
      const isActive =
        booking.status === "CheckedIn" || booking.status === "InHouse";
      return (
        <Badge
          className={cn(
            "border-0 text-muted-foreground shadow-sm",
            isActive
              ? "bg-orange-600 dark:bg-orange-700"
              : "bg-muted dark:bg-muted"
          )}
        >
          {isActive ? (
            <Wrench className="mr-1 h-3 w-3 animate-pulse" />
          ) : (
            <CalendarDays className="mr-1 h-3 w-3" />
          )}
          {isActive ? "Đang bảo trì" : "Lên lịch"}
        </Badge>
      );
    }

    let bgClass = "bg-gray-600 dark:bg-gray-700";
    let icon = <Clock className="mr-1 h-3 w-3" />;

    switch (booking.status) {
      case "Confirmed":
        bgClass = "bg-blue-600 dark:bg-blue-700";
        icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
        break;
      case "CheckedIn":
      case "InHouse":
        bgClass = "bg-green-600 dark:bg-green-700";
        icon = <LogIn className="mr-1 h-3 w-3" />;
        break;
      case "CheckedOut":
        bgClass = "bg-gray-500 dark:bg-gray-600";
        icon = <LogOut className="mr-1 h-3 w-3" />;
        break;
      case "Cancelled":
        bgClass = "bg-destructive dark:bg-destructive";
        icon = <XCircle className="mr-1 h-3 w-3" />;
        break;
    }

    return (
      <Badge
        className={cn(
          "border-0 text-white shadow-sm hover:opacity-90",
          bgClass
        )}
      >
        {icon}
        {statusConfig?.label || booking.status}
      </Badge>
    );
  };

  const renderPrimaryAction = () => {
    const btnClass = "w-full shadow-sm font-semibold transition-all";
    if (!hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist])) {
      return (
        <Button
          size="sm"
          variant="outline"
          className={cn(btnClass, "bg-background dark:bg-background")}
          onClick={handleViewDetail}
        >
          Xem chi tiết
        </Button>
      );
    }

    // Room Block Actions
    if (isRoomBlock) {
      if (booking.status === "Confirmed") {
        return (
          <Button
            size="sm"
            className={cn(
              btnClass,
              "bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800 text-white"
            )}
            onClick={handleCheckIn}
            disabled={isProcessing}
          >
            <Wrench className="mr-2 h-4 w-4" /> Bắt đầu bảo trì
          </Button>
        );
      }
      if (booking.status === "CheckedIn" || booking.status === "InHouse") {
        return (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              btnClass,
              "border-orange-200 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300"
            )}
            onClick={handleCheckOut}
            disabled={isProcessing}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất bảo trì
          </Button>
        );
      }
      return null;
    }

    // Guest Booking Actions
    if (canCheckIn) {
      return (
        <Button
          size="sm"
          variant="success"
          className={btnClass}
          onClick={handleCheckIn}
          disabled={isProcessing}
        >
          <LogIn className="mr-2 h-4 w-4" /> Check-in ngay
        </Button>
      );
    }
    if (canCheckOut) {
      return (
        <Button
          size="sm"
          variant="warning"
          className={btnClass}
          onClick={handleCheckOut}
          disabled={isProcessing}
        >
          <LogOut className="mr-2 h-4 w-4" /> Checkout
        </Button>
      );
    }
    if (canConfirmPayment) {
      return (
        <Button
          size="sm"
          variant="default"
          className={btnClass}
          onClick={handleViewDetail}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" /> Xác nhận cọc
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className={cn(btnClass, "bg-background dark:bg-background")}
        onClick={handleViewDetail}
      >
        Xem chi tiết
      </Button>
    );
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-lg",
          isRoomBlock
            ? "border-orange-200 dark:border-orange-800 bg-orange-50/10 dark:bg-orange-950/20 hover:border-orange-300 dark:hover:border-orange-700"
            : "border-border dark:border-border bg-card dark:bg-card hover:border-primary/20 dark:hover:border-primary/30"
        )}
      >
        {/* HEADER SECTION */}
        <div
          className={cn(
            "flex items-center justify-between border-b px-4 py-2.5",
            isRoomBlock
              ? "bg-orange-100/50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900"
              : "bg-muted/50 dark:bg-muted/50 border-border dark:border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-xs font-bold",
                isRoomBlock
                  ? "text-orange-700 dark:text-orange-400"
                  : "text-muted-foreground dark:text-muted-foreground"
              )}
            >
              #{booking.bookingCode}
            </span>
            <div
              className={cn(
                "h-4 w-[1px]",
                isRoomBlock
                  ? "bg-orange-200 dark:bg-orange-800"
                  : "bg-border dark:bg-border"
              )}
            ></div>

            {/* Source Pill */}
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isRoomBlock
                  ? "text-orange-800 dark:text-orange-300"
                  : "text-foreground dark:text-foreground"
              )}
            >
              {isRoomBlock ? (
                <ShieldAlert className="h-3 w-3" />
              ) : booking.source === "OTA" ? (
                <Globe className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              <span className="truncate max-w-[80px]">
                {isRoomBlock
                  ? "Bảo trì"
                  : booking.source === "OTA"
                    ? booking.otaName
                    : BOOKING_SOURCES.find((s) => s.key === booking.source)
                        ?.label || "Trực tiếp"}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={
                  isRoomBlock
                    ? "hover:bg-orange-200/50 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300"
                    : ""
                }
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDetail}>
                <DoorOpen className="mr-2 h-4 w-4" />{" "}
                {isRoomBlock ? "Chi tiết bảo trì" : "Xem chi tiết"}
              </DropdownMenuItem>
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
              canCancel ? (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />{" "}
                  {isRoomBlock ? "Hủy lịch bảo trì" : "Hủy đặt phòng"}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* BODY SECTION */}
        <div className="flex-1 px-4 py-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Button
                variant="link"
                onClick={() => setDetailSheetOpen(true)}
                className="p-0 h-auto font-bold text-lg text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary hover:no-underline"
              >
                <span
                  className={cn(
                    "line-clamp-1 text-left truncate w-20",
                    isRoomBlock &&
                      "text-orange-900 dark:text-orange-200 uppercase tracking-tight"
                  )}
                >
                  {isRoomBlock
                    ? "BẢO TRÌ"
                    : booking.customerName || "Khách vãng lai"}
                </span>
              </Button>
              <BookingDetailSheet
                bookingCode={booking.bookingCode!}
                open={detailSheetOpen}
                onOpenChange={setDetailSheetOpen}
              />
              {renderStatusBadge()}
            </div>
          </div>

          {/* Timeline Visual */}
          <div
            className={cn(
              "rounded-lg border p-3",
              isRoomBlock
                ? "bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900"
                : "bg-muted/30 dark:bg-muted/30 border-border dark:border-border"
            )}
          >
            <div className="flex items-center justify-between text-sm">
              {/* Start Date */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    isRoomBlock
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-muted-foreground dark:text-muted-foreground"
                  )}
                >
                  {isRoomBlock ? "Từ ngày" : "Check-in"}
                </span>
                <span
                  className={cn(
                    "font-bold",
                    isArrivingToday && !isRoomBlock
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground dark:text-foreground"
                  )}
                >
                  {checkinDate ? format(checkinDate, "dd/MM") : "--/--"}
                </span>
              </div>

              {/* Arrow / Duration */}
              <div className="flex flex-col items-center px-4">
                <span className="mb-1 text-[10px] font-medium text-muted-foreground dark:text-muted-foreground">
                  {nights} {isRoomBlock ? "ngày" : "đêm"}
                </span>
                <div className="relative flex w-full items-center">
                  <div
                    className={cn(
                      "h-[1px] w-12",
                      isRoomBlock
                        ? "bg-orange-300 dark:bg-orange-700"
                        : "bg-border dark:bg-border"
                    )}
                  ></div>
                  <ArrowRight
                    className={cn(
                      "absolute right-0 -mr-1 h-3 w-3",
                      isRoomBlock
                        ? "text-orange-400 dark:text-orange-600"
                        : "text-muted-foreground dark:text-muted-foreground"
                    )}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col items-end">
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    isRoomBlock
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-muted-foreground dark:text-muted-foreground"
                  )}
                >
                  {isRoomBlock ? "Đến ngày" : "Check-out"}
                </span>
                <span className="font-bold text-foreground dark:text-foreground">
                  {checkoutDate ? format(checkoutDate, "dd/MM") : "--/--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div
          className={cn(
            "border-t p-3",
            isRoomBlock
              ? "border-orange-100 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20"
              : "border-border dark:border-border"
          )}
        >
          {renderPrimaryAction()}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRoomBlock ? "Hủy lịch bảo trì?" : "Xác nhận hủy đặt phòng"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRoomBlock ? (
                `Bạn có chắc chắn muốn mở lại phòng ${booking.bookingCode} để đón khách?`
              ) : (
                <>
                  Bạn có chắc chắn muốn hủy đặt phòng{" "}
                  <strong>{booking.bookingCode}</strong>? Hành động này không
                  thể hoàn tác.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90"
            >
              {isProcessing
                ? "Đang xử lý..."
                : isRoomBlock
                  ? "Hủy bảo trì"
                  : "Hủy đặt phòng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
