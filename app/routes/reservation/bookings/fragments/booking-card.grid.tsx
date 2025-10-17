import { format } from "date-fns";
import {
  CalendarIcon,
  Users,
  CreditCard,
  BedDouble,
  EllipsisVertical,
} from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

import { cn } from "~/lib/utils";
import useBookingSchema from "~/services/schema/booking.schema";
export function getBookingStatusColor(status: number): string {
  switch (status) {
    case 0: // Pending
      return "yellow";
    case 1: // Confirmed
      return "green";
    case 2: // Checked-in
      return "blue";
    case 3: // Checked-out
      return "purple";
    case 4: // Cancelled
      return "red";
    default:
      return "gray";
  }
}

export function getBookingStatusText(status: number): string {
  switch (status) {
    case 0:
      return "Chờ xác nhận";
    case 1:
      return "Đã xác nhận";
    case 2:
      return "Đã nhận phòng";
    case 3:
      return "Đã trả phòng";
    case 4:
      return "Đã hủy";
    default:
      return "Không xác định";
  }
}
const { BookingItemSchema } = useBookingSchema();
type BookingItem = z.infer<typeof BookingItemSchema>;
interface BookingCardProps {
  booking: BookingItem;
  onClick?: (booking: BookingItem) => void;
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const statusColor = getBookingStatusColor(booking.status);
  const statusText = getBookingStatusText(booking.status);
  console.log(booking);
  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-all hover:shadow-md cursor-pointer",
        `border-l-4 border-l-${statusColor}-500`
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              {booking.customerName || "Khách chưa xác định"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {booking.bookingCode}
            </p>
          </div>
          <Badge
            className={cn(
              `bg-${statusColor}-100 text-${statusColor}-700 hover:bg-${statusColor}-200`
            )}
          >
            {statusText}
          </Badge>
        </div>
        <CardAction>
          <Button
            size={"icon"}
            variant={"ghost"}
            onClick={() => onClick?.(booking)}
          >
            <EllipsisVertical />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-0">
        <div className="flex gap-2 items-center">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <span>{format(new Date(booking.checkinDate), "dd/MM/yyyy")}</span>
            <span className="mx-1">→</span>
            <span>{format(new Date(booking.checkoutDate), "dd/MM/yyyy")}</span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <BedDouble className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{booking.rooms?.length || 0} phòng</div>
        </div>

        <div className="flex gap-2 items-center">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            {booking.adults || 0} người lớn
            {booking.children ? `, ${booking.children} trẻ em` : ""}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {booking.paidAmount.toLocaleString("vi-VN")} /{" "}
              {booking.totalAmount.toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <Badge
            variant={
              booking.paidAmount >= booking.totalAmount
                ? "outline"
                : "destructive"
            }
          >
            {booking.paidAmount >= booking.totalAmount
              ? "Đã thanh toán"
              : "Chưa thanh toán đủ"}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
