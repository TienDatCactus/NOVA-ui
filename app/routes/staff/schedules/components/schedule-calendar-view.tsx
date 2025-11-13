import { format, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { StaffShiftListItem } from "~/services/api/staff-shift/dto";
import type { WorkShiftListItem } from "~/services/api/work-shift/dto";
import { cn } from "~/lib/utils";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface ScheduleCalendarViewProps {
  shifts: StaffShiftListItem[];
  workShifts: WorkShiftListItem[];
  weekStart: Date;
  onAddStaff?: (shiftId: string, date: string) => void;
  onDeleteStaff?: (shift: StaffShiftListItem) => void;
  onEditStaff?: (shift: StaffShiftListItem) => void;
}

export default function ScheduleCalendarView({
  shifts,
  workShifts,
  weekStart,
  onAddStaff,
  onDeleteStaff,
  onEditStaff,
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
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>
              </td>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const cellKey = getCellKey(dateStr, shift.id);
                const isHovered = hoveredCell === cellKey;

                // Get staff for this shift and date (match by shift name)
                const staffList =
                  groupedShifts[dateStr]?.[shift.name] || [];

                return (
                  <td
                    key={dateStr}
                    className="border p-2 align-top min-h-[80px] relative"
                  >
                    <div className="space-y-1 overflow-hidden">
                      {/* Staff List */}
                      {staffList.map((staff) => {
                        const badgeKey = `${staff.id}`;
                        const isHoveredBadge = hoveredBadge === badgeKey;

                        return (
                          <div
                            key={staff.id}
                            className="relative group"
                            onMouseEnter={() => setHoveredBadge(badgeKey)}
                            onMouseLeave={() => setHoveredBadge(null)}
                          >
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-1 pr-6 block whitespace-normal break-words relative cursor-pointer hover:bg-secondary/80"
                              onClick={() => onEditStaff?.(staff)}
                            >
                              {staff.staffName || "N/A"}
                              {isHoveredBadge && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteStaff?.(staff);
                                  }}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-destructive/20 transition-colors"
                                >
                                  <X className="h-3 w-3 text-destructive" />
                                </button>
                              )}
                            </Badge>
                          </div>
                        );
                      })}

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
