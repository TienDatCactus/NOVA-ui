import { format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type {
  StaffAttendanceListItem,
  StaffAttendanceListResponse,
} from "~/services/api/staff/staff-attendance/dto";
import type {
  StaffShiftListItem,
  StaffShiftListResponseDto,
} from "~/services/api/staff/staff-shift/dto";
import type { WorkShiftListResponseDto } from "~/services/api/work-shift/dto";
import {
  useDeleteStaffShift,
  useMarkAbsent,
  useMarkPresent,
} from "../container/query.hooks";
import { useScheduleTableData } from "../container/table-data.hooks";
import {
  getAttendanceFromMap,
  useAttendanceMap,
} from "../utils/attendance-map";
import { getStaffListFromGrouped } from "../utils/table-grouping";
import CreateScheduleDialog from "./create-schedule-dialog";
import DeleteScheduleDialog from "./delete-schedule-dialog";
import MarkAbsentDialog from "./mark-absent-dialog";
import { ShiftCard } from "./shift-card";
import UpdateScheduleDialog from "./update-schedule-dialog";
import { hasAnyRole } from "~/lib/auth/bouncer";

interface UnifiedScheduleTableProps {
  viewMode: "shift" | "staff";
  workShifts: WorkShiftListResponseDto;
  shifts: StaffShiftListResponseDto;
  attendances: StaffAttendanceListResponse;
  weekDays: Date[];
}

export default function UnifiedScheduleTable({
  viewMode,
  workShifts,
  shifts,
  attendances,
  weekDays,
}: UnifiedScheduleTableProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [markAbsentDialogOpen, setMarkAbsentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected data for dialogs
  const [selectedShift, setSelectedShift] = useState<StaffShiftListItem | null>(
    null
  );
  const [selectedAttendance, setSelectedAttendance] =
    useState<StaffAttendanceListItem | null>(null);

  const markPresent = useMarkPresent();

  // Get grouped data based on view mode
  const tableData = useScheduleTableData(shifts, workShifts, viewMode);
  const attendanceMap = useAttendanceMap(attendances);

  // Helper to get attendance
  const getAttendance = (staffId: string, shiftId: string, date: string) =>
    getAttendanceFromMap(attendanceMap, staffId, shiftId, date);

  const getCellKey = (date: string, id: string) => `${date}-${id}`;
  if (!workShifts || workShifts.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-12 text-center text-muted-foreground">
        Chưa có ca làm việc nào được thiết lập
      </div>
    );
  }

  // Prepare rows based on view mode
  const rows =
    viewMode === "shift"
      ? workShifts
      : getStaffListFromGrouped(
          tableData.data as Record<string, StaffShiftListItem[]>
        );

  return (
    <>
      <div className="border rounded-lg overflow-x-auto bg-card">
        <table className="w-full border-collapse table-fixed min-w-[1000px]">
          <colgroup>
            <col style={{ width: "150px" }} />
            {weekDays.map((_, idx) => (
              <col key={idx} style={{ width: "140px" }} />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-muted/50">
              <th className="border p-3 text-left font-semibold text-sm">
                {viewMode === "shift" ? "Ca làm việc" : "Nhân viên"}
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
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-muted-foreground border"
                >
                  {viewMode === "shift"
                    ? "Không có lịch làm việc nào trong tuần này"
                    : "Chưa có lịch làm việc nào"}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowId =
                  viewMode === "shift" ? (row as any).id : (row as any).staffId;
                const rowName =
                  viewMode === "shift"
                    ? (row as any).name
                    : (row as any).staffName;

                return (
                  <tr key={rowId} className="hover:bg-muted/30">
                    {/* Row Header */}
                    <td className="border p-3 bg-muted/30">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">{rowName}</div>
                        {viewMode === "shift" && (
                          <div className="text-xs text-muted-foreground">
                            {(row as any).startTime?.substring(0, 5)} -{" "}
                            {(row as any).endTime?.substring(0, 5)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Day Columns */}
                    {weekDays.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const cellKey = getCellKey(dateStr, rowId);
                      const isHovered = hoveredCell === cellKey;

                      // Get shifts for this cell
                      let cellShifts: StaffShiftListItem[] = [];
                      if (viewMode === "shift") {
                        const groupedData = tableData.data as Record<
                          string,
                          Record<string, StaffShiftListItem[]>
                        >;
                        cellShifts = groupedData[dateStr]?.[rowName] || [];
                      } else {
                        const groupedData = tableData.data as Record<
                          string,
                          StaffShiftListItem[]
                        >;
                        cellShifts =
                          groupedData[rowId]?.filter(
                            (s) => s.workDate === dateStr
                          ) || [];
                      }

                      return (
                        <td
                          key={dateStr}
                          className="border p-2 align-top min-h-[80px] relative overflow-visible"
                        >
                          <div className="space-y-1 overflow-visible">
                            {/* Shift Cards */}
                            <div className="space-y-2 overflow-visible">
                              {cellShifts.map((shift) => {
                                const attendance = getAttendance(
                                  shift.staffId,
                                  shift.shiftId,
                                  shift.workDate
                                );
                                return (
                                  <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    attendance={attendance}
                                    viewMode={viewMode}
                                    workShifts={workShifts}
                                    onEdit={(shift) => {
                                      setSelectedShift(shift);
                                      setUpdateDialogOpen(true);
                                    }}
                                    onDelete={(shiftId) => {
                                      const shiftToDelete = cellShifts.find(
                                        (s) => s.id === shiftId
                                      );
                                      if (shiftToDelete) {
                                        setSelectedShift(shiftToDelete);
                                        setDeleteDialogOpen(true);
                                      }
                                    }}
                                    onMarkPresent={(attendance) => {
                                      setSelectedAttendance(attendance);
                                      if (attendance) {
                                        markPresent.mutate(attendance.id);
                                      }
                                    }}
                                    onMarkAbsent={(attendance) => {
                                      setSelectedAttendance(attendance);
                                      setMarkAbsentDialogOpen(true);
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Add Button - Only in shift view */}
                            {viewMode === "shift" && (
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
                                    onClick={() => setCreateDialogOpen(true)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Thêm nhân viên
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <UpdateScheduleDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        shift={selectedShift}
      />
      <MarkAbsentDialog
        open={markAbsentDialogOpen}
        onOpenChange={setMarkAbsentDialogOpen}
        attendance={selectedAttendance}
      />

      <DeleteScheduleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        shift={selectedShift}
        onSuccess={() => {
          setSelectedShift(null);
        }}
      />
    </>
  );
}
