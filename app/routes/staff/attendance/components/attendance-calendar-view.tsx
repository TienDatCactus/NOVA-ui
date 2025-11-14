import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { X, CheckCircle2 } from "lucide-react";
import type { StaffAttendanceListItem } from "~/services/api/staff-attendance/dto";
import type { WorkShiftListItem } from "~/services/api/work-shift/dto";
import { cn } from "~/lib/utils";

interface AttendanceCalendarViewProps {
  attendanceData: StaffAttendanceListItem[];
  weekDays: Date[];
  workShifts: WorkShiftListItem[];
  onMarkAbsent?: (item: StaffAttendanceListItem) => void;
  onMarkPresent?: (item: StaffAttendanceListItem) => void;
  onMarkAttendance?: (item: StaffAttendanceListItem) => void;
}

export default function AttendanceCalendarView({
  attendanceData,
  weekDays,
  workShifts,
  onMarkAbsent,
  onMarkPresent,
  onMarkAttendance,
}: AttendanceCalendarViewProps) {
  // Group attendance by date and shift name for lookup
  const attendanceByDateAndShift = useMemo(() => {
    const grouped: Record<string, Record<string, StaffAttendanceListItem[]>> = {};

    attendanceData.forEach((item) => {
      const dateStr = item.workDate;
      const shiftName = item.shiftName;

      if (!grouped[dateStr]) {
        grouped[dateStr] = {};
      }
      if (!grouped[dateStr][shiftName]) {
        grouped[dateStr][shiftName] = [];
      }
      grouped[dateStr][shiftName].push(item);
    });

    return grouped;
  }, [attendanceData]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return { label: "Đã chấm công", variant: "default" as const };
      case "absent":
        return { label: "Vắng mặt", variant: "destructive" as const };
      case "assigned":
        return { label: "Chưa chấm công", variant: "secondary" as const };
      default:
        return { label: status, variant: "secondary" as const };
    }
  };

  return (
    <div className="border rounded-lg overflow-x-auto bg-card">
      <table className="w-full border-collapse table-fixed min-w-[1000px]">
        <colgroup>
          <col style={{ width: "150px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "140px" }} />
        </colgroup>
        <thead>
          <tr className="bg-muted/50">
            <th className="border p-3 text-left font-semibold text-sm min-w-[150px]">
              Ca làm việc
            </th>
            {weekDays.map((day, idx) => {
              const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const dayNum = format(day, "d");
              return (
                <th
                  key={idx}
                  className={cn(
                    "border p-3 text-center font-medium",
                    isToday && "bg-primary/10"
                  )}
                >
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "text-xs text-muted-foreground",
                        isToday && "text-primary font-semibold"
                      )}
                    >
                      {format(day, "EEEE", { locale: vi })}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold",
                        isToday && "text-primary"
                      )}
                    >
                      {dayNum}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {workShifts.map((shift) => (
            <tr key={shift.id}>
              {/* Shift Name Column */}
              <td className="border p-3 bg-muted/30">
                <div className="space-y-1">
                  <div className="font-semibold text-sm">{shift.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                  </div>
                </div>
              </td>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayAttendances = attendanceByDateAndShift[dateStr]?.[shift.name] || [];

                return (
                  <td
                    key={dateStr}
                    className="border p-2 align-top min-h-[80px] relative"
                  >
                    <div className="space-y-1 overflow-hidden">
                      {/* Staff List */}
                      {dayAttendances.map((item) => {
                        const badge = getStatusBadge(item.status);
                        const isAbsent = item.status.toLowerCase() === "absent";
                        const hasReason = isAbsent && item.absentReason;

                        const cardContent = (
                          <div
                            key={item.id}
                            onClick={() => {
                              // Logic: Click để mở dialog tương ứng
                              if (item.status.toLowerCase() === "present") {
                                onMarkAbsent?.(item);
                              } else if (item.status.toLowerCase() === "absent") {
                                onMarkAttendance?.(item);
                              }
                            }}
                            className={cn(
                              "group relative p-2 bg-background rounded-md border hover:border-primary/50 transition-colors",
                              (item.status.toLowerCase() === "present" || item.status.toLowerCase() === "absent") && "cursor-pointer"
                            )}
                          >
                            <div className="space-y-1">
                              <div className="text-xs font-medium truncate">
                                {item.staffName}
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {item.staffCode}
                              </div>
                              <Badge variant={badge.variant} className="text-[10px] h-5">
                                {badge.label}
                              </Badge>
                            </div>

                            {/* Action buttons */}
                            {item.status.toLowerCase() === "assigned" && (
                              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                  size="icon"
                                  variant="default"
                                  className="h-6 w-6 rounded-full"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    onMarkAttendance?.(item);
                                  }}
                                  title="Đánh dấu điểm danh"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-6 w-6 rounded-full"
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    onMarkAbsent?.(item);
                                  }}
                                  title="Đánh dấu vắng mặt"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        );

                        // Wrap với Tooltip nếu là vắng mặt và có lý do
                        return hasReason ? (
                          <TooltipProvider key={item.id}>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                {cardContent}
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs font-semibold mb-1">Lý do vắng mặt:</p>
                                <p className="text-xs">{item.absentReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          cardContent
                        );
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {workShifts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Không có ca làm việc nào trong tuần này
        </div>
      )}
    </div>
  );
}
