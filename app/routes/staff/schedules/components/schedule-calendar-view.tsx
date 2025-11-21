import { addDays, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { StaffAttendanceListItem } from "~/services/api/staff-attendance/dto";
import type { StaffShiftListItem } from "~/services/api/staff-shift/dto";
import type { WorkShiftListItem } from "~/services/api/work-shift/dto";

interface ScheduleCalendarViewProps {
  shifts: StaffShiftListItem[];
  attendanceData?: StaffAttendanceListItem[]; // Optional attendance data
  workShifts: WorkShiftListItem[];
  weekStart: Date;
  onAddStaff?: (shiftId: string, date: string) => void;
  onDeleteStaff?: (shift: StaffShiftListItem) => void;
  onEditStaff?: (shift: StaffShiftListItem) => void;
  onMarkAttendance?: (attendance: StaffAttendanceListItem) => void;
  onMarkAbsent?: (attendance: StaffAttendanceListItem) => void;
}

export default function ScheduleCalendarView({
  shifts,
  attendanceData = [],
  workShifts,
  weekStart,
  onAddStaff,
  onDeleteStaff,
  onEditStaff,
  onMarkAttendance,
  onMarkAbsent,
}: ScheduleCalendarViewProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Generate 7 days from weekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Group shifts by date and shift name
  const groupedShifts: Record<
    string,
    Record<string, StaffShiftListItem[]>
  > = {};

  shifts.forEach((shift) => {
    const dateStr = shift.workDate;
    const shiftName = shift.shiftName || "unknown";

    if (!groupedShifts[dateStr]) {
      groupedShifts[dateStr] = {};
    }
    if (!groupedShifts[dateStr][shiftName]) {
      groupedShifts[dateStr][shiftName] = [];
    }
    groupedShifts[dateStr][shiftName].push(shift);
  });

  // Create attendance lookup map: `${staffId}-${shiftId}-${workDate}` -> attendance
  const attendanceMap = new Map<string, StaffAttendanceListItem>();
  attendanceData.forEach((att) => {
    const key = `${att.staffId}-${att.shiftId}-${att.workDate}`;
    attendanceMap.set(key, att);
  });

  // Helper to get attendance for a shift
  const getAttendance = (
    shift: StaffShiftListItem
  ): StaffAttendanceListItem | null => {
    const key = `${shift.staffId}-${shift.shiftId}-${shift.workDate}`;
    return attendanceMap.get(key) || null;
  };

  // Helper to get badge variant based on status
  const getStatusBadge = (status?: string) => {
    if (!status || status.toLowerCase() === "assigned") {
      return {
        variant: "secondary" as const,
        label: "Chưa chấm",
        showLabel: true,
      };
    }
    if (status.toLowerCase() === "present") {
      return {
        variant: "default" as const,
        label: "Đã chấm công",
        showLabel: false,
      }; // Không hiển thị text
    }
    if (status.toLowerCase() === "absent") {
      return {
        variant: "destructive" as const,
        label: "Vắng mặt",
        showLabel: true,
      };
    }
    return { variant: "secondary" as const, label: status, showLabel: true };
  };

  const getCellKey = (date: string, slotId: string) => `${date}-${slotId}`;

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
              const isToday = isSameDay(day, new Date());
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
                    {shift.startTime.substring(0, 5)} -{" "}
                    {shift.endTime.substring(0, 5)}
                  </div>
                </div>
              </td>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const cellKey = getCellKey(dateStr, shift.id);
                const isHovered = hoveredCell === cellKey;

                // Get staff for this shift and date (match by shift name)
                const staffList = groupedShifts[dateStr]?.[shift.name] || [];

                return (
                  <td
                    key={dateStr}
                    className="border p-2 align-top min-h-[80px] relative overflow-visible"
                  >
                    <div className="space-y-1 overflow-visible">
                      {/* Staff List - wrap in container with overflow visible */}
                      <div className="space-y-2 overflow-visible">
                        {staffList.map((staff) => {
                          const badgeKey = `${staff.id}`;
                          const isHoveredBadge = hoveredBadge === badgeKey;
                          const attendance = getAttendance(staff);
                          const statusBadge = getStatusBadge(
                            attendance?.status
                          );
                          const isAbsent =
                            attendance?.status.toLowerCase() === "absent";
                          const isPresent =
                            attendance?.status.toLowerCase() === "present";
                          const isAssigned =
                            !attendance ||
                            attendance?.status.toLowerCase() === "assigned";
                          const hasReason =
                            isAbsent && attendance?.absentReason;

                          const cardContent = (
                            <div
                              key={staff.id}
                              className="relative group p-2 bg-background rounded-md border hover:border-primary/50 transition-colors cursor-pointer overflow-visible"
                              onMouseEnter={() => setHoveredBadge(badgeKey)}
                              onMouseLeave={() => setHoveredBadge(null)}
                              onClick={() => onEditStaff?.(staff)}
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-medium truncate">
                                  {staff.staffName || "N/A"}
                                </div>
                                {/* Chỉ hiển thị badge nếu có label */}
                                {statusBadge.showLabel && (
                                  <Badge
                                    variant={statusBadge.variant}
                                    className="text-[10px] h-5"
                                  >
                                    {statusBadge.label}
                                  </Badge>
                                )}
                              </div>

                              {/* Action buttons - hiển thị khi hover */}
                              {isHoveredBadge && (
                                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-50">
                                  {/* Buttons cho status "assigned" (chưa chấm) */}
                                  {isAssigned && attendance && (
                                    <>
                                      <Button
                                        size="icon"
                                        variant="default"
                                        className="h-6 w-6 rounded-full shadow-md"
                                        onClick={(e: any) => {
                                          e.stopPropagation();
                                          onMarkAttendance?.(attendance);
                                        }}
                                        title="Đánh dấu điểm danh"
                                      >
                                        <CheckCircle2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-6 w-6 rounded-full shadow-md"
                                        onClick={(e: any) => {
                                          e.stopPropagation();
                                          onMarkAbsent?.(attendance);
                                        }}
                                        title="Đánh dấu vắng mặt"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}

                                  {/* Button chuyển đổi cho "present" -> "absent" */}
                                  {isPresent && attendance && (
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="h-6 w-6 rounded-full shadow-md"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        onMarkAbsent?.(attendance);
                                      }}
                                      title="Chuyển sang vắng mặt"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}

                                  {/* Button chuyển đổi cho "absent" -> "present" */}
                                  {isAbsent && attendance && (
                                    <Button
                                      size="icon"
                                      variant="default"
                                      className="h-6 w-6 rounded-full shadow-md"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        onMarkAttendance?.(attendance);
                                      }}
                                      title="Chuyển sang đã chấm công"
                                    >
                                      <CheckCircle2 className="h-3 w-3" />
                                    </Button>
                                  )}

                                  {/* Nút X để xóa lịch - luôn hiển thị */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteStaff?.(staff);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/20 transition-colors shadow-md"
                                    title="Xóa lịch"
                                  >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );

                          // Wrap with Tooltip if absent and has reason
                          return hasReason ? (
                            <TooltipProvider key={staff.id}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  {cardContent}
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-xs font-semibold mb-1">
                                    Lý do vắng mặt:
                                  </p>
                                  <p className="text-xs">
                                    {attendance?.absentReason}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            cardContent
                          );
                        })}
                      </div>

                      {/* Empty space at the end - shows "Add" button on hover */}
                      <div
                        className={cn(
                          "h-7 rounded transition-colors cursor-pointer flex items-center justify-center",
                          isHovered && "bg-muted/30"
                        )}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {isHovered && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-7 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => {
                              onAddStaff?.(shift.id, dateStr);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Thêm nhân viên
                          </Button>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {shifts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Không có lịch làm việc nào trong tuần này
        </div>
      )}
    </div>
  );
}
