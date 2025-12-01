// booking-detail.dialog.tsx
import { differenceInDays, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
  BedDouble,
  Info,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router"; // Ensure this matches your router version (v6 uses react-router-dom)

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area"; // Optional: if you have this component, otherwise use div with overflow

import { CHECK_IN_TIME, CHECK_OUT_TIME } from "~/lib/constants";
import FE_URL from "~/lib/fe-url";
import { cn, formatMoney } from "~/lib/utils";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";
import { PAYMENT_STATUSES } from "~/services/types/payment.types";
import { useBookingDetail } from "../container/booking-query.hooks";

// --- Helpers ---
const getStatusBadge = (statusValue: string | undefined) => {
  const status = BOOKING_STATUSES.find((s) => s.value === statusValue);
  return status ? <Badge variant={status.variant}>{status.label}</Badge> : null;
};

const getPaymentStatusBadge = (statusKey: string | undefined) => {
  const status = PAYMENT_STATUSES.find((s) => s.key === statusKey);
  if (!status) return null;
  // Custom styling for payment statuses if needed
  const isPaid = statusKey === "paid"; // Example logic
  return (
    <Badge variant={isPaid ? "default" : "warning"} className="ml-2">
      {status.label}
    </Badge>
  );
};

interface BookingDetailSheetProps {
  bookingCode: string;
  customerName: string;
}

export default function BookingDetailSheet({
  bookingCode,
  customerName,
}: BookingDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const { data, isPending, error } = useBookingDetail({
    bookingCode,
    enabled: open,
  });

  if (!bookingCode) return null;

  const totalDays = data
    ? differenceInDays(parseISO(data.checkoutDate), parseISO(data.checkinDate))
    : 0;

  const remainingAmount = data ? data.totalAmount - data.paidAmount : 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto font-bold text-lg text-gray-900 hover:text-primary hover:no-underline"
        >
          {/* Removed <h3> inside button for better semantics */}
          <span className="line-clamp-1 text-left">
            {customerName || "Khách vãng lai"}
          </span>
        </Button>
      </SheetTrigger>

      {/* Added flex col and max-h-screen to ensure footer sticks */}
      <SheetContent className="w-full sm:max-w-2xl gap-0 p-0 flex flex-col h-full">
        {/* === HEADER === */}
        <SheetHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-2xl font-bold tracking-tight">
                  {isPending ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    data?.bookingCode || bookingCode
                  )}
                </SheetTitle>
                <SheetDescription className="mt-1 flex items-center gap-2">
                  {data?.source && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      <MapPin className="w-3 h-3" />
                      {
                        BOOKING_SOURCES.find((s) => s.key === data.source)
                          ?.label
                      }
                    </span>
                  )}
                </SheetDescription>
              </div>

              {data && (
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(data.status)}
                  {getPaymentStatusBadge(data.invoiceStatus || undefined)}
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* === BODY (Scrollable) === */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {isPending && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
              <Info className="h-10 w-10 text-destructive/50" />
              <p className="text-destructive font-medium">
                Không thể tải thông tin đặt phòng
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Đóng
              </Button>
            </div>
          )}

          {data && (
            <div className="p-6 space-y-8">
              {/* 1. CUSTOMER INFO */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Khách hàng
                  </h3>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Contact Info */}
                    <div className="flex-1 space-y-3">
                      <p className="text-lg font-bold text-gray-900">
                        {data.customer.fullName}
                      </p>

                      <div className="space-y-2">
                        {data.customer.phoneNumber && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                            <a
                              href={`tel:${data.customer.phoneNumber}`}
                              className="hover:text-primary transition-colors hover:underline"
                            >
                              {data.customer.phoneNumber}
                            </a>
                          </div>
                        )}
                        {data.customer.email && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                            <a
                              href={`mailto:${data.customer.email}`}
                              className="hover:text-primary transition-colors hover:underline truncate"
                            >
                              {data.customer.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note Section - Responsive Grid */}
                    {data.note && (
                      <>
                        <Separator
                          orientation="vertical"
                          className="hidden md:block h-auto"
                        />
                        <Separator
                          orientation="horizontal"
                          className="md:hidden"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                            Ghi chú
                          </h4>
                          <div className="bg-yellow-50/50 p-3 rounded text-sm text-gray-700 border border-yellow-100/50">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {data.note}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. BOOKING TIMELINE */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Thời gian lưu trú
                  </h3>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-0 overflow-hidden">
                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Nhận phòng</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {format(parseISO(data.checkinDate), "dd/MM")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(parseISO(data.checkinDate), "yyyy")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {format(parseISO(data.checkinDate), "EEEE", {
                          locale: vi,
                        })}
                      </p>
                      <div className="mt-2 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-600 font-medium">
                        {CHECK_IN_TIME}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Trả phòng</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {format(parseISO(data.checkoutDate), "dd/MM")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(parseISO(data.checkoutDate), "yyyy")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {format(parseISO(data.checkoutDate), "EEEE", {
                          locale: vi,
                        })}
                      </p>
                      <div className="mt-2 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-600 font-medium">
                        {CHECK_OUT_TIME}
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="bg-slate-50 border-t p-4 grid grid-cols-3 divide-x text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalDays}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Đêm
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {data.adults}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Người lớn
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {data.children}
                      </p>
                      <p className="text-xs text-gray-500 font-medium uppercase">
                        Trẻ em
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. ROOM LIST */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                      Danh sách phòng
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {data.rooms.length} phòng
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {data.rooms.map((room, index) => (
                    <div
                      key={room.roomId}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-dashed border-gray-300 hover:border-primary/50 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-500 text-xs font-bold shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {room.roomName}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {room.roomTypeName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 sm:mt-0 pl-11 sm:pl-0">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {format(parseISO(room.fromDate), "dd/MM")} -{" "}
                          {format(parseISO(room.toDate), "dd/MM")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. PAYMENT */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Thanh toán
                  </h3>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-5 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Tổng tiền</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatMoney(data.totalAmount).vndFormatted}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Đã thanh toán</span>
                    <span className="text-base font-semibold text-green-600">
                      {formatMoney(data.paidAmount).vndFormatted}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-medium text-gray-900">
                      Còn lại
                    </span>
                    <span
                      className={cn(
                        "text-xl font-bold",
                        remainingAmount > 0
                          ? "text-orange-600"
                          : "text-gray-900"
                      )}
                    >
                      {formatMoney(remainingAmount).vndFormatted}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mt-4 text-xs flex items-center justify-between">
                    <span className="text-gray-500">Phương thức</span>
                    <span className="font-medium text-gray-700 uppercase">
                      {data.paymentMethod || "Tiền mặt"}
                    </span>
                  </div>

                  {data.invoices && data.invoices.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
                      <Receipt className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {data.invoices.length} hóa đơn điện tử đã xuất
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t bg-white shrink-0 sm:justify-between sm:space-x-0">
          <div className="hidden sm:flex items-center text-xs text-gray-400">
            ID: {bookingCode}
          </div>
          <div className="w-full sm:w-auto">
            <Link to={FE_URL.dashboard.bookings.bookingDetail(bookingCode)}>
              <Button className="w-full sm:w-auto gap-2">
                Xem chi tiết đầy đủ
              </Button>
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
