import { format, parseISO } from "date-fns";
import { Calendar, CircleOff, Coffee, StickyNote } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
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
import { useRoomBookingHistory } from "../../container/rooms/query.hooks";

interface BookingHistoryRowProps {
  roomId: string;
}

function BookingHistory({ roomId }: BookingHistoryRowProps) {
  const [date, setDate] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date("2024-12-01"),
    to: new Date(),
  });
  const { data: bookings, isLoading } = useRoomBookingHistory({
    id: roomId,
    params: {
      from: format(new Date(date!.from), "yyyy-MM-dd"),
      to: format(new Date(date!.to), "yyyy-MM-dd"),
    },
  });
  if (isLoading) {
    return (
      <div>
        <div className="flex gap-2">
          <DatePicker
            className="w-40"
            value={date?.from}
            onChange={(from) =>
              from && date?.to && setDate({ from, to: date?.to })
            }
          />
          <DatePicker
            className="w-40"
            value={date?.to}
            onChange={(to) =>
              to && date?.from && setDate({ from: date?.from, to })
            }
          />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div>
        <div className="flex gap-2">
          <DatePicker
            className="w-40"
            value={date?.from}
            onChange={(from) =>
              from && date?.to && setDate({ from, to: date?.to })
            }
          />
          <DatePicker
            className="w-40"
            value={date?.to}
            onChange={(to) =>
              to && date?.from && setDate({ from: date?.from, to })
            }
          />
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar />
            </EmptyMedia>
            <EmptyTitle>Chưa có lịch sử</EmptyTitle>
            <EmptyDescription>
              Phòng này không có lịch sử đặt phòng nào trong khoảng thời gian{" "}
              <span className="text-base text-black">
                từ {format(date.from, "yyyy-MM-dd")} đến{" "}
                {format(date.to, "yyyy-MM-dd")}
              </span>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="border-none">
      <div className="flex gap-2 pb-2">
        <DatePicker
          className="w-40"
          value={date?.from}
          onChange={(from) =>
            from && date?.to && setDate({ from, to: date?.to })
          }
        />
        <DatePicker
          className="w-40"
          value={date?.to}
          onChange={(to) =>
            to && date?.from && setDate({ from: date?.from, to })
          }
        />
      </div>
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
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate line-clamp-1 max-w-40">
                    {booking.bookingId}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-sm">
                  {format(parseISO(booking.fromDate), "yyyy-MM-dd")}
                </span>
              </TableCell>

              {/* To Date */}
              <TableCell>
                <span className="text-sm">
                  {format(parseISO(booking.toDate), "yyyy-MM-dd")}
                </span>
              </TableCell>

              <TableCell className="text-center">
                {booking.anyBreakfast ? (
                  <Badge variant="outline" className="gap-1">
                    <Coffee className="h-3 w-3" />
                    {booking.breakfastDaysCount} ngày
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    Không có
                    <CircleOff className="w-4 h-4" />
                  </span>
                )}
              </TableCell>

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
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    Không có
                    <CircleOff className="w-4 h-4" />
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default BookingHistory;
