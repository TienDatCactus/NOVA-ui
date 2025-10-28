// booking-detail.dialog.tsx
import { useState } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  Users,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  FileText,
  BedDouble,
  Clock,
  Receipt,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useBookingDetail } from "../container/useBookingQuery";

function BookingDetailDialog({ bookingCode }: { bookingCode: string }) {
  const [open, setOpen] = useState(false);
  const { data, isPending, error } = useBookingDetail({
    bookingCode,
    enabled: open,
  });

  if (!bookingCode) return null;

  const getStatusVariant = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      Confirmed: "default",
      CheckedIn: "secondary",
      CheckedOut: "outline",
      Pending: "secondary",
      Cancelled: "destructive",
    };
    return variants[status] || "default";
  };

  const getPaymentStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Paid: "default",
      Unpaid: "destructive",
      Partial: "secondary",
    };
    return variants[status] || "secondary";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="link" className="p-0">
          {bookingCode}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl px-2">
        <SheetHeader className="sticky top-0 z-10 bg-background pb-4">
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
                {isPending && "Đang tải thông tin..."}
                {error && "Không thể tải thông tin đặt phòng"}
              </SheetDescription>
            </div>
            {data && (
              <div className="flex gap-2">
                <Badge variant={getStatusVariant(data.status)}>
                  {data.status}
                </Badge>
                <Badge variant={getPaymentStatusVariant(data.paymentStatus)}>
                  {data.paymentStatus}
                </Badge>
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
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">
                Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại.
              </p>
            </CardContent>
          </Card>
        )}

        {data && (
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                      {data.customer.fullName}
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${data.customer.phoneNumber}`}
                        className="text-primary hover:underline"
                      >
                        {data.customer.phoneNumber}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${data.customer.email}`}
                        className="text-primary hover:underline"
                      >
                        {data.customer.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Thông tin đặt phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Nhận phòng
                      </p>
                      <p className="font-semibold">
                        {format(parseISO(data.checkinDate), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(data.checkinDate), "EEEE", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Trả phòng</p>
                      <p className="font-semibold">
                        {format(parseISO(data.checkoutDate), "dd/MM/yyyy", {
                          locale: vi,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(data.checkoutDate), "EEEE", {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {differenceInDays(
                          parseISO(data.checkoutDate),
                          parseISO(data.checkinDate)
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Đêm</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.adults}</p>
                      <p className="text-xs text-muted-foreground">Người lớn</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.children}</p>
                      <p className="text-xs text-muted-foreground">Trẻ em</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      <span className="text-muted-foreground">Nguồn:</span>{" "}
                      <span className="font-medium">{data.source}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BedDouble className="h-5 w-5" />
                    Danh sách phòng ({data.rooms.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.rooms.map((room, index) => (
                      <div
                        key={room.roomId}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{room.roomName}</p>
                            <p className="text-sm text-muted-foreground">
                              {room.roomTypeName}
                            </p>
                          </div>
                          <Badge variant="outline">Phòng {index + 1}</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(parseISO(room.fromDate), "dd/MM/yyyy")} →{" "}
                            {format(parseISO(room.toDate), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tổng tiền:</span>
                      <span className="text-lg font-bold">
                        {formatMoney(data.totalAmount).vndFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Đã thanh toán:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatMoney(data.paidAmount).vndFormatted}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Còn lại:</span>
                      <span className="text-lg font-bold text-orange-600">
                        {
                          formatMoney(data.totalAmount - data.paidAmount)
                            .vndFormatted
                        }
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phương thức:</span>
                    <Badge variant="outline">
                      {data.paymentMethod || "Chưa thanh toán"}
                    </Badge>
                  </div>
                  {data.invoices.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span>{data.invoices.length} hóa đơn đã tạo</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Note Card */}
              {data.note && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Ghi chú
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{data.note}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default BookingDetailDialog;
