// booking-detail.dialog.tsx
import { differenceInDays, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Mail, MapPin, Phone, Receipt } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { CHECK_IN_TIME, CHECK_OUT_TIME } from "~/lib/constants";
import { cn, formatMoney } from "~/lib/utils";
import { PAYMENT_STATUSES } from "~/services/types/payment.types";
import { useBookingDetail } from "../container/booking-query.hooks";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/api/booking/booking.types";

function BookingDetailDialog({ bookingCode }: { bookingCode: string }) {
  const [open, setOpen] = useState(false);
  const { data, isPending, error } = useBookingDetail({
    bookingCode,
    enabled: open,
  });

  if (!bookingCode) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="link" className="p-0">
          {bookingCode}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl gap-0 p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold">
                {isPending ? (
                  <Skeleton className="h-8 w-48" />
                ) : (
                  data?.bookingCode || bookingCode
                )}
              </SheetTitle>
              <SheetDescription>
                {error && "Không thể tải thông tin đặt phòng"}
              </SheetDescription>
            </div>
            {data && (
              <div className="flex gap-2">
                <Badge
                  variant={
                    BOOKING_STATUSES.find(
                      (status) => status.value === data.status
                    )?.variant
                  }
                >
                  {
                    BOOKING_STATUSES.find(
                      (status) => status.value === data.status
                    )?.label
                  }
                </Badge>
                {data.invoiceStatus && (
                  <Badge variant="warning">
                    {
                      PAYMENT_STATUSES.find(
                        (status) => status.key === data.invoiceStatus
                      )?.label
                    }
                  </Badge>
                )}
              </div>
            )}
          </div>
        </SheetHeader>

        {isPending && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-destructive">
              Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại.
            </p>
          </div>
        )}

        {data && (
          <div className="flex-1 overflow-y-auto p-6 bg-white text-gray-800 space-y-10">
            <section>
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-3">
                Thông tin khách hàng
              </h3>
              <div
                className={cn(
                  data.note ? "grid grid-cols-2" : "grid grid-cols-1"
                )}
              >
                <div className="space-y-2">
                  <p className="text-base font-semibold">
                    {data.customer.fullName}
                  </p>
                  {data.customer.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${data.customer.phoneNumber}`}
                        className="hover:underline text-blue-600"
                      >
                        {data.customer.phoneNumber}
                      </a>
                    </div>
                  )}
                  {data.customer.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a
                        href={`mailto:${data.customer.email}`}
                        className="hover:underline text-blue-600"
                      >
                        {data.customer.email}
                      </a>
                    </div>
                  )}
                </div>
                {data.note && (
                  <section className="">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-3">
                      Ghi chú
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 hover:line-clamp-none line-clamp-2 transition-all">
                      {data.note} Lorem ipsum dolor sit amet, consectetur
                      adipisicing elit. Iure deserunt necessitatibus adipisci,
                      quas consectetur qui tenetur consequuntur quam ipsa ea
                      pariatur nihil blanditiis quasi aut dolor, rerum quidem
                      nam! Magni.
                    </p>
                  </section>
                )}
              </div>
            </section>

            <Separator />
            {/* ========== BOOKING INFO ========== */}
            <section className="">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-3">
                  Thông tin đặt phòng
                </h3>
                <Badge variant={"info"} className=" flex items-center  text-sm">
                  <MapPin />
                  <span className="font-medium">
                    {
                      BOOKING_SOURCES.find(
                        (source) => source.key === data.source
                      )?.label
                    }
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500">Nhận phòng</p>
                  <p className="text-lg font-semibold">
                    {format(parseISO(data.checkinDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(data.checkinDate), "EEEE", { locale: vi })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Giờ quy định:{" "}
                    <span className="font-medium text-gray-700">
                      {CHECK_IN_TIME}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Trả phòng</p>
                  <p className="text-lg font-semibold">
                    {format(parseISO(data.checkoutDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(data.checkoutDate), "EEEE", {
                      locale: vi,
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Giờ quy định:{" "}
                    <span className="font-medium text-gray-700">
                      {CHECK_OUT_TIME}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 text-center">
                <div>
                  <p className="text-xl font-bold text-blue-600">
                    {differenceInDays(
                      parseISO(data.checkoutDate),
                      parseISO(data.checkinDate)
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Đêm</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{data.adults}</p>
                  <p className="text-xs text-gray-500">Người lớn</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{data.children}</p>
                  <p className="text-xs text-gray-500">Trẻ em</p>
                </div>
              </div>
            </section>
            <Separator />
            {/* ========== ROOM LIST ========== */}
            <section className="">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-3">
                Danh sách phòng ({data.rooms.length})
              </h3>
              <div className="space-y-4">
                {data.rooms.map((room, index) => (
                  <div
                    key={room.roomId}
                    className="p-3 rounded border-dashed border-2  hover:border-primary flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{room.roomName}</p>
                      <p className="text-xs text-gray-500">
                        {room.roomTypeName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <span>
                          {format(parseISO(room.fromDate), "dd/MM/yyyy")} →{" "}
                          {format(parseISO(room.toDate), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs border rounded px-2 py-0.5 text-gray-600 bg-gray-50">
                      #{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <Separator />
            {/* ========== PAYMENT INFO ========== */}
            <section className="">
              <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-3">
                Thanh toán
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tổng tiền</span>
                  <span className="font-semibold">
                    {formatMoney(data.totalAmount).vndFormatted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Đã thanh toán</span>
                  <span className="font-semibold text-green-600">
                    {formatMoney(data.paidAmount).vndFormatted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Còn lại</span>
                  <span className="font-bold text-orange-600">
                    {
                      formatMoney(data.totalAmount - data.paidAmount)
                        .vndFormatted
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm ">
                  <span className="text-gray-500">Phương thức thanh toán</span>
                  <span className="px-2 py-0.5 rounded border text-gray-700 bg-gray-50">
                    {data.paymentMethod || "Tiền mặt"}
                  </span>
                </div>

                {!!data.invoices && Array.isArray(data.invoices) && data.invoices.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                    <Receipt className="h-4 w-4" />
                    <span>{data.invoices.length} hóa đơn đã tạo</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default BookingDetailDialog;
