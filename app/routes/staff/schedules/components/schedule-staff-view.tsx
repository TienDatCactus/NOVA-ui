import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { StaffShiftListItem } from "~/services/api/staff/staff-shift/dto";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";
import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";
import { cn } from "~/lib/utils";

interface ScheduleStaffViewProps {
  shifts: StaffShiftListItem[];
  attendanceData: StaffAttendanceListItem[];
  workShifts: WorkShiftListItem[];
  weekStart: Date;
  onAddStaff?: (shiftId: string, date: string) => void;
  onDeleteStaff?: (shift: StaffShiftListItem) => void;
  onEditStaff?: (shift: StaffShiftListItem) => void;
  onMarkAttendance?: (attendance: StaffAttendanceListItem) => void;
  onMarkAbsent?: (attendance: StaffAttendanceListItem) => void;
}

export default function ScheduleStaffView({
  shifts,
  attendanceData,
  workShifts,
  weekStart,
  onDeleteStaff,
  onEditStaff,
  onMarkAttendance,
  onMarkAbsent,
}: ScheduleStaffViewProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Generate week days (7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Group shifts by staff and date
  const groupedByStaff: Record<string, StaffShiftListItem[]> = {};

  // Only group shifts that have active work shifts
  shifts.forEach((shift) => {
    const workShift = workShifts.find((ws) => ws.id === shift.shiftId);
    // Only include if work shift exists and is active
    if (workShift?.active) {
      const key = shift.staffId;
      if (!groupedByStaff[key]) {
        groupedByStaff[key] = [];
      }
      groupedByStaff[key].push(shift);
    }
  });

  // Get unique staff list from grouped data
  const staffList = Object.keys(groupedByStaff).map((staffId) => {
    const firstShift = groupedByStaff[staffId][0];
    return {
      staffId,
      staffName: firstShift.staffName || "N/A",
      staffCode: firstShift.staffId, // Can use staffId as code if not available
    };
  });

  // Create attendance map for quick lookup
  const attendanceMap = new Map<string, StaffAttendanceListItem>();
  attendanceData.forEach((att) => {
    const key = `${att.staffId}-${att.shiftId}-${att.workDate}`;
    attendanceMap.set(key, att);
  });

  const getAttendance = (
    staffId: string,
    shiftId: string,
    date: string
  ): StaffAttendanceListItem | null => {
    const key = `${staffId}-${shiftId}-${date}`;
    return attendanceMap.get(key) || null;
  };

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
      };
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

  // Get shifts for a staff on a specific date
  const getStaffShiftsForDate = (
    staffId: string,
    date: Date
  ): StaffShiftListItem[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return groupedByStaff[staffId]?.filter((s) => s.workDate === dateStr) || [];
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
              Nhân viên
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
                    <div className="text-xs text-muted-foreground capitalize">
                      {format(day, "EEEE", { locale: vi })}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold",
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
          {staffList.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                Chưa có lịch làm việc nào
              </td>
            </tr>
          ) : (
            staffList.map((staff) => (
              <tr key={staff.staffId} className="hover:bg-muted/30">
                {/* Staff Info Column */}
                <td className="border p-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">
                      {staff.staffName}
                    </div>
                  </div>
                </td>

                {/* Day Columns */}
                {weekDays.map((day) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const staffShifts = getStaffShiftsForDate(staff.staffId, day);

                  return (
                    <td
                      key={dateStr}
                      className="border p-2 align-top min-h-[80px] relative overflow-visible"
                    >
                      <div className="space-y-1 overflow-visible">
                        {/* Shift List */}
                        <div className="space-y-2 overflow-visible">
                          {staffShifts.map((shift) => {
                            const badgeKey = `${shift.id}`;
                            const isHoveredBadge = hoveredBadge === badgeKey;
                            const attendance = getAttendance(
                              shift.staffId,
                              shift.shiftId,
                              shift.workDate
                            );
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
                                key={shift.id}
                                className="relative group p-2 bg-background rounded-md border hover:border-primary/50 transition-colors cursor-pointer overflow-visible"
                                onMouseEnter={() => setHoveredBadge(badgeKey)}
                                onMouseLeave={() => setHoveredBadge(null)}
                                onClick={() => onEditStaff?.(shift)}
                              >
                                <div className="space-y-1">
                                  <div className="text-xs font-medium truncate">
                                    {shift.shiftName || "N/A"}
                                  </div>
                                  {workShifts.find(
                                    (ws) => ws.id === shift.shiftId
                                  ) && (
                                    <div className="text-[10px] text-muted-foreground">
                                      {workShifts
                                        .find((ws) => ws.id === shift.shiftId)
                                        ?.startTime.substring(0, 5)}{" "}
                                      -{" "}
                                      {workShifts
                                        .find((ws) => ws.id === shift.shiftId)
                                        ?.endTime.substring(0, 5)}
                                    </div>
                                  )}
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
                                        onDeleteStaff?.(shift);
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
                              <TooltipProvider key={shift.id}>
                                <Tooltip delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    {cardContent}
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs"
                                  >
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
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
