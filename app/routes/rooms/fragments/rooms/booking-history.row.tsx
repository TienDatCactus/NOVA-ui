import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  ClipboardClock,
  Coffee,
  FileText,
  StickyNote,
} from "lucide-react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomBookingHistoryResponseSchema } = useRoomSchema();
type RoomBookingHistory = z.infer<typeof RoomBookingHistoryResponseSchema>;

interface BookingHistoryRowProps {
  bookings: RoomBookingHistory;
  isLoading?: boolean;
  date?: { from: Date; to: Date };
  onDateChange?: (dateRange: { from: Date; to: Date }) => void;
}

function BookingHistoryRow({
  bookings,
  isLoading = false,
  date,
  onDateChange,
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
              <Skeleton key={i} className="h-12 w-full" />
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
            <ClipboardClock className="h-4 w-4" />
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
          <ClipboardClock className="h-4 w-4" />
          Lịch sử đặt phòng ({bookings.length})
        </CardTitle>
        <CardAction>
          <div className="flex gap-2">
            <DatePicker
              disabled
              className="w-40"
              value={date?.from}
              onChange={(from) =>
                from && date?.to && onDateChange?.({ from, to: date?.to })
              }
            />
            <DatePicker
              className="w-40"
              value={date?.to}
              onChange={(to) =>
                to && date?.from && onDateChange?.({ from: date?.from, to })
              }
            />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Mã đặt phòng</TableHead>
              <TableHead>Từ ngày</TableHead>
              <TableHead>Đến ngày</TableHead>
              <TableHead className="text-center">Bữa sáng</TableHead>
              <TableHead className="w-[60px] text-center">Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.bookingRoomId}>
                {/* Booking ID */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.bookingId}</span>
                  </div>
                </TableCell>

                {/* From Date */}
                <TableCell>
                  <span className="text-sm">
                    {format(parseISO(booking.fromDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </TableCell>

                {/* To Date */}
                <TableCell>
                  <span className="text-sm">
                    {format(parseISO(booking.toDate), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </TableCell>

                {/* Breakfast */}
                <TableCell className="text-center">
                  {booking.anyBreakfast ? (
                    <Badge variant="outline" className="gap-1">
                      <Coffee className="h-3 w-3" />
                      {booking.breakfastDaysCount} ngày
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Note */}
                <TableCell className="text-center">
                  {booking.note && booking.note.trim() !== "" ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <StickyNote className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-xs p-3"
                          align="center"
                        >
                          <p className="text-xs whitespace-pre-wrap">
                            {booking.note}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default BookingHistoryRow;
