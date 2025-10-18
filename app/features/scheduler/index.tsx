// RoomWeekScheduler_shadcnStyle.tsx
import {
  addDays,
  addMinutes,
  format,
  isToday,
  parseISO,
  startOfDay,
  startOfMinute,
} from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dot,
  TriangleAlert,
  UserStar,
} from "lucide-react";
import React, { useEffect, useRef, useState, useMemo } from "react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  DAYS_COUNT,
  firstColWidth,
  headerRows,
  rowHeight,
  SUBS_PER_DAY,
  totalSubCols,
} from "~/lib/constants";
import {
  cn,
  daysBetweenFloor,
  parseDateYMD,
  startOfLocalDay,
} from "~/lib/utils";
import useBookingSchema from "~/services/schema/booking.schema";
import useBookingRoomsWeek from "~/routes/reservation/bookings/container/useBookingRoomsWeek";

// Use API schema types directly - no normalization
const { BookingItemByWeekSchema } = useBookingSchema();
type RoomSchedulerData = z.infer<typeof BookingItemByWeekSchema>;
type BookingInWeek = RoomSchedulerData["bookings"][number];

// Room configuration
const ROOM_TYPES = [
  { type: "Traditional", count: 3, startIndex: 0 },
  { type: "Romantic", count: 7, startIndex: 3 },
  { type: "Unique", count: 1, startIndex: 10 },
  { type: "Chalet", count: 2, startIndex: 11 },
] as const;

const TOTAL_ROOMS = 13;

// Processed booking for display
type DisplayBooking = {
  bookingId: string;
  bookingCode: string;
  roomId: string;
  roomIndex: number;
  startSubIndex: number;
  spanSubCount: number;
  status: BookingInWeek["status"];
  twClasses: { border: string; bgHover: string; bg: string; text: string };
  leftClipped: boolean;
  rightClipped: boolean;
  originalStart: string;
  originalEnd: string;
  segmentFrom: string;
  segmentTo: string;
  laneIndex?: number;
};

// Status styling mapping - using API status directly
const STATUS_STYLES: Record<
  string,
  { border: string; bgHover: string; bg: string; text: string }
> = {
  Confirmed: {
    border: "border-blue-400",
    bgHover: "hover:bg-blue-400",
    bg: "bg-blue-400/20",
    text: "text-blue-700",
  },
  CheckedIn: {
    border: "border-teal-400",
    bgHover: "hover:bg-teal-400",
    bg: "bg-teal-400/20",
    text: "text-teal-700",
  },
  CheckedOut: {
    border: "border-gray-400",
    bgHover: "hover:bg-gray-400",
    bg: "bg-gray-400/10",
    text: "text-gray-700",
  },
  Pending: {
    border: "border-violet-400",
    bgHover: "hover:bg-violet-400",
    bg: "bg-violet-400/20",
    text: "text-violet-700",
  },
  Cancelled: {
    border: "border-red-400",
    bgHover: "hover:bg-red-400",
    bg: "bg-red-400/20",
    text: "text-red-700",
  },
};

/* ---------- Component ---------- */
export default function RoomWeekScheduler() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfLocalDay(new Date())
  );
  const [now, setNow] = useState<Date>(new Date());

  // Fetch booking data from API
  const {
    data: roomsData,
    isPending,
    refetch,
  } = useBookingRoomsWeek({
    weekStart: format(currentWeekStart, "yyyy/MM/dd"),
  });

  useEffect(() => {
    let timerId: any;

    const currentTime = new Date();
    const startOfNextMinute = addMinutes(startOfMinute(currentTime), 1);
    const delay = startOfNextMinute.getTime() - currentTime.getTime();

    const timeoutId = setTimeout(() => {
      setNow(new Date());

      timerId = setInterval(() => {
        setNow(new Date());
      }, 60000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timerId);
    };
  }, []);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const days = Array.from({ length: DAYS_COUNT }).map((_, i) =>
    addDays(currentWeekStart, i)
  );
  const windowStart = currentWeekStart;
  const windowEnd = addDays(currentWeekStart, DAYS_COUNT);

  const displayBookings = useMemo(() => {
    if (!roomsData || roomsData.length === 0) return [];

    const merged: DisplayBooking[] = [];

    const roomIndexMap = new Map<string, number>();
    let currentIndex = 0;

    ROOM_TYPES.forEach((roomType) => {
      for (let i = 0; i < roomType.count; i++) {
        roomIndexMap.set(`${roomType.type}-${i}`, currentIndex);
        currentIndex++;
      }
    });
    roomsData.forEach((room) => {
      const roomTypeInfo = ROOM_TYPES.find(
        (rt) => rt.type === room.roomTypeName
      );
      if (!roomTypeInfo) return;

      const roomNumber = parseInt(room.roomName.replace(/\D/g, "")) || 0;
      const roomIndex = roomTypeInfo.startIndex + (roomNumber - 1);

      if (roomIndex < 0 || roomIndex >= TOTAL_ROOMS) return;

      room.bookings.forEach((booking) => {
        const bStart = parseDateYMD(booking.checkinDate);
        const bEnd = parseDateYMD(booking.checkoutDate);
        const visStart = bStart < windowStart ? windowStart : bStart;
        const visEnd = bEnd > windowEnd ? windowEnd : bEnd;

        if (visStart >= visEnd) return;

        const startDayIndex = daysBetweenFloor(windowStart, visStart);
        const endDayIndexExclusive = daysBetweenFloor(windowStart, visEnd);
        const startSubIndex = startDayIndex * SUBS_PER_DAY;
        const spanSubCount = Math.max(
          1,
          (endDayIndexExclusive - startDayIndex) * SUBS_PER_DAY
        );

        merged.push({
          bookingId: booking.bookingId,
          bookingCode: booking.bookingCode,
          roomId: room.roomId,
          roomIndex,
          startSubIndex,
          spanSubCount,
          status: booking.status,
          twClasses: STATUS_STYLES[booking.status] || STATUS_STYLES.Pending,
          leftClipped: bStart < windowStart,
          rightClipped: bEnd > windowEnd,
          originalStart: booking.checkinDate,
          originalEnd: booking.checkoutDate,
          segmentFrom: booking.segmentFrom,
          segmentTo: booking.segmentTo,
        });
      });
    });

    return merged;
  }, [roomsData, currentWeekStart]);

  // single-lane per room assignment, overflow counted
  const { processedBookings, overflowMap } = useMemo(() => {
    const byRoom = new Map<number, DisplayBooking[]>();
    for (const m of displayBookings) {
      if (!byRoom.has(m.roomIndex)) byRoom.set(m.roomIndex, []);
      byRoom.get(m.roomIndex)!.push(m);
    }

    const overflow = new Map<number, number>();
    for (let room = 0; room < TOTAL_ROOMS; room++) {
      const arr = (byRoom.get(room) || []).sort(
        (a, b) => a.startSubIndex - b.startSubIndex
      );
      let laneLastEnd = -1;
      let overflowCount = 0;
      for (const b of arr) {
        const s = b.startSubIndex;
        const e = b.startSubIndex + b.spanSubCount;
        if (laneLastEnd <= s) {
          b.laneIndex = 0;
          laneLastEnd = e;
        } else {
          overflowCount += 1;
        }
      }
      overflow.set(room, overflowCount);
    }

    return { processedBookings: displayBookings, overflowMap: overflow };
  }, [displayBookings]);

  // compute current-time indicator (absolute position inside grid)
  function computeIndicatorLeftPx() {
    const grid = gridRef.current;
    if (!grid) return null;
    const gridWidth = grid.clientWidth;
    if (!gridWidth) return null;
    if (now < windowStart || now >= windowEnd) return null;
    const msWindow = DAYS_COUNT * 24 * 60 * 60 * 1000;
    const msFromStart = now.getTime() - windowStart.getTime();
    const frac = Math.max(0, Math.min(1, msFromStart / msWindow));
    const contentWidth = Math.max(0, gridWidth - firstColWidth);
    return firstColWidth + frac * contentWidth;
  }
  const indicatorLeft = Number(computeIndicatorLeftPx());
  const indicatorTop = headerRows * rowHeight;
  const indicatorHeight = TOTAL_ROOMS * rowHeight;

  return (
    <div className="p-4 ">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          >
            <ArrowLeft /> Tuần trước
          </Button>
          <Button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          >
            Tuần sau <ArrowRight />
          </Button>
        </div>
        <div className="text-sm font-medium">
          Tuần bắt đầu: {currentWeekStart.toLocaleDateString("vi-VN")}
        </div>
      </div>

      <ScrollArea className="border rounded shadow-s ">
        <div
          ref={gridRef}
          className="min-w-[1200px] relative"
          style={{
            display: "grid",
            gridTemplateColumns: `${firstColWidth}px repeat(${totalSubCols}, minmax(0, 1fr))`,
            gridAutoRows: `${rowHeight}px`,
          }}
        >
          <div style={{ gridColumn: "1", gridRow: 1 }} className="bg-gray-50" />
          {days.map((d, di) => {
            const colStart = 2 + di * SUBS_PER_DAY;
            return (
              <div
                key={format(d, "yyyy/MM/dd")}
                style={{
                  gridColumn: `${colStart} / span ${SUBS_PER_DAY}`,
                  gridRow: 1,
                }}
                className="p-3 border-l border-b bg-white flex items-center justify-center"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center ">
                    <div className="text-lg font-bold text-slate-700">
                      {d.getDate()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {d.toLocaleDateString("vi-VN", { weekday: "long" })}
                  </div>
                </div>
              </div>
            );
          })}

          {Array.from({ length: TOTAL_ROOMS }).map((_, rIndex) => {
            const roomType = ROOM_TYPES.find(
              (rt) =>
                rIndex >= rt.startIndex && rIndex < rt.startIndex + rt.count
            )!;
            const roomNumber = rIndex - roomType.startIndex + 1;
            const row = headerRows + rIndex + 1;
            return (
              <React.Fragment key={rIndex}>
                <div
                  style={{ gridColumn: 1, gridRow: row }}
                  className="p-3 border-t bg-white text-sm font-medium"
                >
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold">
                      {roomType.type} {roomNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {roomType.type}
                    </div>
                  </div>
                </div>

                {Array.from({ length: totalSubCols }).map((_, si) => (
                  <div
                    key={`${roomNumber}-${si}`}
                    style={{ gridColumn: `${2 + si}`, gridRow: row }}
                    className="border-t border-l min-h-0"
                  />
                ))}
              </React.Fragment>
            );
          })}

          {processedBookings.map((mb) => {
            if (mb.laneIndex === undefined) return null;
            const gridColStart = 2 + mb.startSubIndex;
            const gridRow = headerRows + mb.roomIndex + 1;
            const cls = mb.twClasses;

            const formattedFrom = format(
              parseISO(mb.segmentFrom),
              "dd/MM/yyyy HH:mm"
            );
            const formattedTo = format(
              parseISO(mb.segmentTo),
              "dd/MM/yyyy HH:mm"
            );

            return (
              <div
                key={mb.bookingId}
                title={`${mb.bookingCode} (${formattedFrom} → ${formattedTo})`}
                style={{
                  gridColumn: `${gridColStart} / span ${mb.spanSubCount}`,
                  gridRow: gridRow,
                }}
                className={cn(
                  `flex items-center self-center z-20 h-10 justify-between px-3 mx-4 py-2 cursor-pointer transition-all duration-300 ease-in-out group`,
                  "rounded-sm border relative text-sm font-medium hover:text-white",
                  `${cls.bg}`,
                  cls.bgHover,
                  cls.border,
                  cls.text
                )}
              >
                {mb.leftClipped && (
                  <ChevronLeft className="absolute -left-4 size-4 text-sm text-muted-foreground " />
                )}
                <div className="flex items-center truncate font-medium">
                  <Dot size={20} />
                  {mb.bookingCode}
                </div>
                {mb.rightClipped && (
                  <ChevronRight className="absolute -right-4 size-4 text-muted-foreground" />
                )}
                <div className="flex gap-2 items-center">
                  <Badge variant="outline" className="text-xs">
                    {mb.status}
                  </Badge>
                </div>
              </div>
            );
          })}

          {(() => {
            if (!gridRef.current) return null;
            if (now < windowStart || now >= windowEnd) return null;
            const gridW = gridRef.current.clientWidth;
            if (!gridW) return null;
            return (
              <>
                <div
                  aria-hidden
                  className="border border-dashed border-blue-600 transition-all duration-300 ease-in-out"
                  style={{
                    position: "absolute",
                    left: indicatorLeft,
                    top: indicatorTop,
                    height: indicatorHeight,
                    transform: "translateX(-1px)",
                    zIndex: 50,
                    pointerEvents: "none",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: indicatorLeft,
                    top: indicatorTop - 24,
                    transform: "translateX(-50%)",
                  }}
                >
                  <Badge className="text-xs px-2 py-0.5 rounded shadow-sm">
                    {format(now, "HH:mm")}
                  </Badge>
                </div>
              </>
            );
          })()}
        </div>
      </ScrollArea>
    </div>
  );
}
