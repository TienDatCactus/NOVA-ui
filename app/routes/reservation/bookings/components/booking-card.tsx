import {
  format,
  isAfter,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  BookCopy,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  CheckCircle2,
  Clock,
  DoorOpen,
  Globe,
  LogIn,
  LogOut,
  MoreVertical,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
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
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { DASHBOARD } from "~/lib/fe-url";
import { cn, useCalculateNights } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
import {
  useCancelBooking,
  useUpdateBookingStatus,
} from "../container/booking-mutation.hooks";
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

  const canConfirmPayment = booking.status === "Pending";
  const canCheckIn =
    booking.status === "Confirmed" &&
    !!checkinDate &&
    !isBefore(startOfDay(new Date()), startOfDay(checkinDate));

  const canCheckOut =
    booking.status === "InHouse" || booking.status === "CheckedIn";
  const canCancel =
    booking.status === "Pending" || booking.status === "Confirmed";

  const handleCheckIn = async () => {
    try {
      await updateStatus("CheckedIn");
      await updateStatus("InHouse");

      toast.success("Check-in thành công");
      refetch?.();
    } catch {
      toast.error("Check-in thất bại");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking();
      toast.success("Hủy đặt phòng thành công");
      refetch?.();
      setCancelDialogOpen(false);
    } catch {
      toast.error("Hủy đặt phòng thất bại");
    }
  };

  const nights = useCalculateNights({
    checkinDate: booking.checkinDate,
    checkoutDate: booking.checkoutDate,
  });
  const handleViewDetail = () => {
    navigate(DASHBOARD.bookings.bookingDetail(booking.bookingCode!));
  };

  const renderStatusBadge = () => {
    let bgClass = "bg-gray-600";
    let icon = <Clock className="mr-1 h-3 w-3" />;

    switch (booking.status) {
      case "Confirmed":
        bgClass = "bg-blue-600"; // Solid Blue
        icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
        break;
      case "CheckedIn":
      case "InHouse":
        bgClass = "bg-green-600"; // Solid Green
        icon = <LogIn className="mr-1 h-3 w-3" />;
        break;
      case "CheckedOut":
        bgClass = "bg-gray-500";
        icon = <LogOut className="mr-1 h-3 w-3" />;
        break;
      case "Cancelled":
        bgClass = "bg-destructive";
        icon = <XCircle className="mr-1 h-3 w-3" />;
        break;
      case "NoShow":
        bgClass = "bg-orange-600";
        icon = <UserX className="mr-1 h-3 w-3" />;
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

    if (canCheckIn) {
      return (
        <Button
          size="sm"
          className={cn(btnClass, "bg-green-600 hover:bg-green-700 text-white")}
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
          className={cn(btnClass, "bg-amber-500 hover:bg-amber-600 text-white")}
          onClick={handleViewDetail}
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
        className={cn(btnClass, "bg-white hover:bg-gray-50")}
        onClick={handleViewDetail}
      >
        Xem chi tiết
      </Button>
    );
  };
  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/20 hover:shadow-lg">
        {/* HEADER SECTION: System Info */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-gray-500">
              #{booking.bookingCode}
            </span>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            {/* Source Pill */}
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
              {booking.source === "OTA" ? (
                <Globe className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              <span className="truncate max-w-[80px]">
                {booking.source === "OTA"
                  ? booking.otaName
                  : BOOKING_SOURCES.find((s) => s.key === booking.source)
                      ?.label || "Trực tiếp"}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewDetail}>
                <DoorOpen className="mr-2 h-4 w-4" /> Xem chi tiết
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Hủy đặt phòng
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* BODY SECTION: Main Content */}
        <div className="flex-1 px-4 py-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Button
                variant="link"
                className="p-0 h-auto font-bold text-lg text-gray-900 hover:text-primary hover:no-underline"
              >
                {/* Removed <h3> inside button for better semantics */}
                <span className="line-clamp-1 text-left">
                  {booking.customerName || "Khách vãng lai"}
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
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-gray-400">
                  Check-in
                </span>
                <span
                  className={cn(
                    "font-bold",
                    isArrivingToday ? "text-green-600" : "text-gray-700"
                  )}
                >
                  {checkinDate ? format(checkinDate, "dd/MM") : "--/--"}
                </span>
              </div>

              {/* Arrow / Duration */}
              <div className="flex flex-col items-center px-4">
                <span className="mb-1 text-[10px] font-medium text-gray-400">
                  {nights} đêm
                </span>
                <div className="relative flex w-full items-center">
                  <div className="h-[1px] w-12 bg-gray-300"></div>
                  <ArrowRight className="absolute right-0 -mr-1 h-3 w-3 text-gray-400" />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-semibold uppercase text-gray-400">
                  Check-out
                </span>
                <span className="font-bold text-gray-700">
                  {checkoutDate ? format(checkoutDate, "dd/MM") : "--/--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER SECTION: Actions */}
        <div className="border-t border-gray-100 p-3">
          {renderPrimaryAction()}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đặt phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đặt phòng{" "}
              <strong>{booking.bookingCode}</strong>? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Đang hủy..." : "Hủy đặt phòng"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Show Confirmation Dialog */}
    </>
  );
}
