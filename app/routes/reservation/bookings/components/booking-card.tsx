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
  BookCopy,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  DoorOpen,
  LogIn,
  LogOut,
  MoreVertical,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { DASHBOARD } from "~/lib/fe-url";
import { cn } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
import {
  useCancelBooking,
  useUpdateBookingStatus,
} from "../container/booking-mutation.hooks";

const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;

interface BookingCardProps {
  booking: BookingListItem;
  refetch?: () => void;
}

export function BookingCard({ booking, refetch }: BookingCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);

  const updateStatus = useUpdateBookingStatus(booking.bookingCode || "");
  const cancelBooking = useCancelBooking(booking.bookingCode || "");
  const navigate = useNavigate();

  const statusConfig = BOOKING_STATUSES.find((s) => s.value === booking.status);

  const checkinDate = booking.checkinDate
    ? parseISO(booking.checkinDate)
    : null;
  const checkoutDate = booking.checkoutDate
    ? parseISO(booking.checkoutDate)
    : null;

  const isArrivingToday = !!(checkinDate && isToday(checkinDate));
  const isDepartingToday = !!(checkoutDate && isToday(checkoutDate));
  const isPastCheckinDate = !!(checkinDate && isAfter(new Date(), checkinDate));

  const canConfirmPayment = booking.status === "Pending";
  const canCheckIn =
    booking.status === "Confirmed" &&
    !!checkinDate &&
    !isBefore(startOfDay(new Date()), startOfDay(checkinDate));
  const canMarkNoShow = booking.status === "Confirmed" && isPastCheckinDate;
  const canCheckOut =
    booking.status === "InHouse" || booking.status === "CheckedIn";
  const canCancel =
    booking.status === "Pending" || booking.status === "Confirmed";
  const isCheckedOut = booking.status === "CheckedOut";

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync("Confirmed");
      toast.success("Xác nhận thanh toán thành công");
      refetch?.();
    } catch {
      toast.error("Xác nhận thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync("InHouse");
      toast.success("Check-in thành công");
      refetch?.();
    } catch {
      toast.error("Check-in thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNoShow = async () => {
    setIsProcessing(true);
    try {
      await updateStatus.mutateAsync("NoShow");
      toast.success("Đã đánh dấu No Show");
      refetch?.();
      setNoShowDialogOpen(false);
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      await cancelBooking.mutateAsync();
      toast.success("Hủy đặt phòng thành công");
      refetch?.();
      setCancelDialogOpen(false);
    } catch {
      toast.error("Hủy đặt phòng thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    navigate(DASHBOARD.bookings.bookingDetail(booking.bookingCode!));
  };

  const handleViewDetail = () => {
    navigate(DASHBOARD.bookings.bookingDetail(booking.bookingCode!));
  };

  const renderPrimaryAction = () => {
    if (canConfirmPayment) {
      return (
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          onClick={handleConfirmPayment}
          disabled={isProcessing}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Xác nhận thanh toán
        </Button>
      );
    }

    if (canCheckIn) {
      return (
        <Button
          size="sm"
          className="flex-1"
          onClick={handleCheckIn}
          disabled={isProcessing}
        >
          <LogIn className="h-4 w-4 mr-1" />
          Check-in
        </Button>
      );
    }

    if (canCheckOut) {
      return (
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          onClick={handleCheckout}
        >
          <LogOut className="h-4 w-4 mr-1" />
          Checkout
        </Button>
      );
    }

    if (isCheckedOut) {
      return (
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={handleViewDetail}
        >
          <BookCopy className="h-4 w-4 mr-1" />
          Xem chi tiết
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={handleViewDetail}
      >
        Xem chi tiết
      </Button>
    );
  };

  const renderSecondaryActions = () => {
    const actions: ReactNode[] = [];

    if (canCancel) {
      actions.push(
        <DropdownMenuItem
          key="cancel"
          className="text-destructive focus:text-destructive"
          onClick={() => setCancelDialogOpen(true)}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Hủy đặt phòng
        </DropdownMenuItem>
      );
    }

    if (canMarkNoShow) {
      actions.push(
        <DropdownMenuItem
          key="noshow"
          className="text-orange-600 focus:text-orange-600"
          onClick={() => setNoShowDialogOpen(true)}
        >
          <UserX className="h-4 w-4 mr-2" />
          Đánh dấu No Show
        </DropdownMenuItem>
      );
    }

    return actions;
  };

  return (
    <>
      <Card
        className={cn(
          "rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-m p-4"
        )}
      >
        <CardContent className="p-0 space-y-4">
          {/* Header: Booking Code + Status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link
                to={DASHBOARD.bookings.bookingDetail(booking.bookingCode!)}
                className="font-mono text-sm font-semibold text-primary hover:underline"
              >
                {booking.bookingCode}
              </Link>
              <p className="text-sm text-muted-foreground">
                {booking.source === "OTA" && booking.otaName
                  ? `${booking.otaName}`
                  : booking.source === "DirectStaff"
                    ? "Trực tiếp"
                    : booking.source}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusConfig?.variant}>
                {statusConfig?.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewDetail}>
                    <DoorOpen className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  {renderSecondaryActions().length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {renderSecondaryActions()}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Guest Name */}
          <div>
            <p className="text-lg font-semibold text-foreground">
              {booking.customerName || "Khách chưa xác định"}
            </p>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1",
                isArrivingToday && "ring-1 ring-primary/30"
              )}
            >
              <CalendarCheck
                className={cn(
                  "h-3.5 w-3.5",
                  isArrivingToday ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="font-medium">
                {checkinDate
                  ? format(checkinDate, "dd/MM/yyyy", { locale: vi })
                  : "N/A"}
              </span>
            </div>

            <span className="text-muted-foreground">-</span>
            <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
              <CalendarX className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">
                {checkoutDate
                  ? format(checkoutDate, "dd/MM/yyyy", { locale: vi })
                  : "N/A"}
              </span>
            </div>
          </div>

          <Separator className="my-1" />

          {/* Quick Actions */}
          <div className="flex gap-2 pt-1">{renderPrimaryAction()}</div>
        </CardContent>
      </Card>

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
      <AlertDialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đánh dấu No Show</AlertDialogTitle>
            <AlertDialogDescription>
              Khách hàng <strong>{booking.customerName}</strong> không đến nhận
              phòng? Đặt phòng <strong>{booking.bookingCode}</strong> sẽ được
              đánh dấu là No Show.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNoShow}
              disabled={isProcessing}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận No Show"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
