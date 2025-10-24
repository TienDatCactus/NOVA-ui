import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Coffee, FileText } from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomBookingHistoryResponseSchema } = useRoomSchema();
type RoomBookingHistory = z.infer<typeof RoomBookingHistoryResponseSchema>;

interface BookingHistoryRowProps {
  bookings: RoomBookingHistory;
  isLoading?: boolean;
}

function BookingHistoryRow({
  bookings,
  isLoading = false,
}: BookingHistoryRowProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lịch sử đặt phòng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lịch sử đặt phòng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>Chưa có lịch sử</EmptyTitle>
              <EmptyDescription>
                Phòng này chưa có lịch sử đặt phòng nào.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Lịch sử đặt phòng ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.bookingRoomId}
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">
                    Mã đặt phòng: {booking.bookingId}
                  </span>
                </div>
                {booking.anyBreakfast && (
                  <Badge variant="outline" className="gap-1">
                    <Coffee className="h-3 w-3" />
                    {booking.breakfastDaysCount} ngày
                  </Badge>
                )}
              </div>

              <Separator className="my-2" />

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Từ ngày:</span>
                  <p className="font-medium">
                    {format(parseISO(booking.fromDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Đến ngày:</span>
                  <p className="font-medium">
                    {format(parseISO(booking.toDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>

              {/* Note (if exists) */}
              {booking.note && booking.note.trim() !== "" && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">
                      Ghi chú:
                    </span>
                    <p className="text-xs text-muted-foreground italic whitespace-pre-wrap">
                      {booking.note}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default BookingHistoryRow;
