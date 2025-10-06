// RoomWeekScheduler_shadcnStyle.tsx
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Dot,
  TriangleAlert,
  UserStar,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DAYS_COUNT,
  firstColWidth,
  headerRows,
  ROOM_COUNT,
  rowHeight,
  SUBS_PER_DAY,
  totalSubCols,
} from "~/lib/constants";
import {
  addDays,
  cn,
  dateKey,
  daysBetweenFloor,
  parseDateYMD,
  startOfLocalDay,
} from "~/lib/utils";

type Booking = {
  id: string;
  guestName: string;
  room: number;
  start: string;
  end: string;
  status:
    | "checked_out"
    | "reserved"
    | "reserved_upcoming"
    | "checkout_alert"
    | "occupied";
};
type MergedBooking = {
  id: string;
  guestName: string;
  room: number;
  startSubIndex: number;
  spanSubCount: number;
  status: Booking["status"];
  twClasses: { border: string; bgHover: string; bg: string; text: string };
  leftClipped: boolean;
  rightClipped: boolean;
  originalStart: string;
  originalEnd: string;
  laneIndex?: number;
};

const STATUS_TW: Record<
  string,
  { border: string; bgHover: string; bg: string; text: string }
> = {
  // mapping chosen to approximate requested hex palette; change classes here to adjust theme
  checked_out: {
    border: "border-gray-400",
    bgHover: "hover:bg-gray-400",
    bg: "bg-gray-400/10",
    text: "text-gray-700",
  },
  reserved: {
    border: "border-violet-400",
    bgHover: "hover:bg-violet-400",
    bg: "bg-violet-400/20",
    text: "text-violet-700",
  },
  reserved_upcoming: {
    border: "border-blue-400",
    bgHover: "hover:bg-blue-400",
    bg: "bg-blue-400/20",
    text: "text-blue-700",
  },
  checkout_alert: {
    border: "border-indigo-400",
    bgHover: "hover:bg-indigo-400",
    bg: "bg-indigo-400/20",
    text: "text-indigo-700",
  },
  occupied: {
    border: "border-teal-400",
    bgHover: "hover:bg-teal-400",
    bg: "bg-teal-400/20",
    text: "text-teal-700",
  },
};

const ANCHOR = startOfLocalDay(new Date());
const SAMPLE_BOOKINGS_FIXED: Booking[] = [
  {
    id: "b1",
    guestName: "Khách A",
    room: 1,
    start: dateKey(addDays(ANCHOR, -2)),
    end: dateKey(addDays(ANCHOR, 8)),
    status: "occupied",
  },
  {
    id: "b2",
    guestName: "Khách B",
    room: 3,
    start: dateKey(addDays(ANCHOR, 1)),
    end: dateKey(addDays(ANCHOR, 2)),
    status: "reserved",
  },
  {
    id: "b3",
    guestName: "Khách C",
    room: 5,
    start: dateKey(addDays(ANCHOR, -3)),
    end: dateKey(addDays(ANCHOR, 10)),
    status: "checkout_alert",
  },
  {
    id: "b4",
    guestName: "Khách D",
    room: 2,
    start: dateKey(addDays(ANCHOR, 3)),
    end: dateKey(addDays(ANCHOR, 6)),
    status: "reserved_upcoming",
  },
  {
    id: "b5",
    guestName: "Khách E",
    room: 13,
    start: dateKey(addDays(ANCHOR, 4)),
    end: dateKey(addDays(ANCHOR, 5)),
    status: "checked_out",
  },
  {
    id: "b6",
    guestName: "Khách F",
    room: 2,
    start: dateKey(addDays(ANCHOR, 2)),
    end: dateKey(addDays(ANCHOR, 3)),
    status: "occupied",
  },
  {
    id: "b7",
    guestName: "Khách G",
    room: 2,
    start: dateKey(addDays(ANCHOR, 7)),
    end: dateKey(addDays(ANCHOR, 10)),
    status: "reserved",
  },
];

/* ---------- Component ---------- */
export default function RoomWeekScheduler() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfLocalDay(new Date())
  );
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const gridRef = useRef<HTMLDivElement | null>(null);

  // build visible days from currentWeekStart
  const days = Array.from({ length: DAYS_COUNT }).map((_, i) =>
    addDays(currentWeekStart, i)
  );
  const windowStart = currentWeekStart;
  const windowEnd = addDays(currentWeekStart, DAYS_COUNT);

  // create merged bookings clipped to window (start inclusive, end exclusive)
  const merged: MergedBooking[] = [];
  for (const b of SAMPLE_BOOKINGS_FIXED) {
    const bStart = parseDateYMD(b.start);
    const bEnd = parseDateYMD(b.end);
    const visStart = bStart < windowStart ? windowStart : bStart;
    const visEnd = bEnd > windowEnd ? windowEnd : bEnd;
    if (visStart >= visEnd) continue;
    const startDayIndex = daysBetweenFloor(windowStart, visStart);
    const endDayIndexExclusive = daysBetweenFloor(windowStart, visEnd);
    const startSubIndex = startDayIndex * SUBS_PER_DAY;
    const spanSubCount = Math.max(
      1,
      (endDayIndexExclusive - startDayIndex) * SUBS_PER_DAY
    );
    merged.push({
      id: b.id,
      guestName: b.guestName,
      room: b.room,
      startSubIndex,
      spanSubCount,
      status: b.status,
      twClasses: STATUS_TW[b.status],
      leftClipped: bStart < windowStart,
      rightClipped: bEnd > windowEnd,
      originalStart: b.start,
      originalEnd: b.end,
    });
  }

  // single-lane per room assignment, overflow counted
  const byRoom = new Map<number, MergedBooking[]>();
  for (const m of merged) {
    if (!byRoom.has(m.room)) byRoom.set(m.room, []);
    byRoom.get(m.room)!.push(m);
  }
  const overflowMap = new Map<number, number>();
  for (let room = 1; room <= ROOM_COUNT; room++) {
    const arr = (byRoom.get(room) || []).sort(
      (a, b) => a.startSubIndex - b.startSubIndex
    );
    let laneLastEnd = -1;
    let overflow = 0;
    for (const b of arr) {
      const s = b.startSubIndex;
      const e = b.startSubIndex + b.spanSubCount;
      if (laneLastEnd <= s) {
        b.laneIndex = 0;
        laneLastEnd = e;
      } else {
        overflow += 1;
      }
    }
    overflowMap.set(room, overflow);
  }

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
  const indicatorHeight = ROOM_COUNT * rowHeight;

  /* ---------- Render ---------- */
  return (
    <div className="p-4 ">
      {/* header controls */}
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

      {/* outer scroll container */}
      <div className="border rounded shadow-s ">
        {/* grid that looks like a table (shadcn-style classes can replace DOM here) */}
        <div
          ref={gridRef}
          className="min-w-[1200px] relative"
          style={{
            display: "grid",
            gridTemplateColumns: `${firstColWidth}px repeat(${totalSubCols}, minmax(0, 1fr))`,
            gridAutoRows: `${rowHeight}px`,
          }}
        >
          {/* Header: days displayed as image-like cards */}
          <div style={{ gridColumn: "1", gridRow: 1 }} className="bg-gray-50" />
          {days.map((d, di) => {
            const colStart = 2 + di * SUBS_PER_DAY;
            return (
              <div
                key={dateKey(d)}
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

          {/* Room rows */}
          {Array.from({ length: ROOM_COUNT }).map((_, rIndex) => {
            const roomNumber = rIndex + 1;
            const row = headerRows + rIndex + 1; // headerRows=1, so first room row = 2
            return (
              <React.Fragment key={roomNumber}>
                <div
                  style={{ gridColumn: 1, gridRow: row }}
                  className="p-3 border-t bg-white text-sm font-medium"
                >
                  {/* Shadcn-style: you can replace this with <TableRow> <TableCell> */}
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold">
                      P.{(100 + roomNumber).toString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Tầng 2</div>
                  </div>
                </div>

                {/* background cells for columns (visual grid) */}
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

          {/* Booking bars (single lane) */}
          {merged.map((mb) => {
            if (mb.laneIndex === undefined) return null;
            const roomIdx = mb.room - 1;
            const gridColStart = 2 + mb.startSubIndex;
            const gridRow = headerRows + roomIdx + 1;
            const cls = mb.twClasses;
            return (
              <div
                key={mb.id}
                title={`${mb.guestName} (${mb.originalStart} → ${mb.originalEnd})`}
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
                <div className="flex items-center  truncate font-medium">
                  <Dot size={20} />
                  {mb.guestName}
                </div>
                {mb.rightClipped && (
                  <ChevronRight className="absolute -right-4 size-4 text-muted-foreground" />
                )}
                <div className="flex gap-2 items-center">
                  <UserStar size={20} />
                  {mb.status === "checkout_alert" && (
                    <TriangleAlert size={20} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Current-time indicator (absolute inside grid) */}
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
                    zIndex: 60,
                  }}
                >
                  <Badge className="text-xs px-2 py-0.5 rounded shadow-sm">
                    {now.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
