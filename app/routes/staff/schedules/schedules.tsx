import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { StaffAttendanceService } from "~/services/api/staff/staff-attendance";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";
import CreateScheduleDialog from "./components/create-schedule-dialog";
import DeleteScheduleDialog from "./components/delete-schedule-dialog";
import MarkAbsentDialog from "./components/mark-absent-dialog";
import MarkAttendanceDialog from "./components/mark-attendance-dialog";
import ScheduleCalendarView from "./components/schedule-calendar-view";
import ScheduleStaffView from "./components/schedule-staff-view";
import UpdateScheduleDialog from "./components/update-schedule-dialog";
import { useSchedulesContainer } from "./container/container.hooks";
import SchedulesViewLayout from "./layouts/schedules-view.layout";
import { useScheduleFilter } from "./container/filter.hooks";

export function clientLoader() {
  return { title: "Lịch làm việc - NOVA" };
}

export default function Schedules() {
  const { filterState, updateFilter, resetFilter } = useScheduleFilter();
  const { isExporting, handleExportMatrix, handleExportForm2 } =
    useScheduleExport({
      currentWeekStart,
      weekEnd,
      selectedStaffId: filterState.selectedStaffId,
    });
  // View mode state
  const [viewMode, setViewMode] = useState<"shift" | "staff">("shift");

  return (
    <SchedulesViewLayout
      filterState={filterState}
      onFilterChange={updateFilter}
      onResetFilter={resetFilter}
      totalShifts={activeShiftsCount}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      {isPending ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      ) : viewMode === "shift" ? (
        <ScheduleCalendarView
          shifts={shifts}
          attendanceData={attendanceData || []}
          workShifts={workShifts}
          weekStart={currentWeekStart}
          onAddStaff={handleAddStaff}
          onDeleteStaff={handleOpenDeleteDialog}
          onEditStaff={handleOpenUpdateDialog}
          onMarkAttendance={handleOpenMarkAttendanceDialog}
          onMarkAbsent={handleOpenMarkAbsentDialog}
        />
      ) : (
        <ScheduleStaffView
          shifts={shifts}
          attendanceData={attendanceData || []}
          workShifts={workShifts}
        />
      )}

      {/* Dialogs */}
      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <DeleteScheduleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        shift={selectedShift}
        onSuccess={handleDeleteSuccess}
      />

      <UpdateScheduleDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        shift={selectedShift}
        onSuccess={handleUpdateSuccess}
      />

      {/* Attendance Dialogs */}
      <MarkAbsentDialog
        open={markAbsentDialogOpen}
        onOpenChange={setMarkAbsentDialogOpen}
        attendance={selectedAttendance}
        onSuccess={handleMarkAbsentSuccess}
      />

      <MarkAttendanceDialog
        open={markAttendanceDialogOpen}
        onOpenChange={setMarkAttendanceDialogOpen}
        attendance={selectedAttendance}
        onSuccess={handleMarkAttendanceSuccess}
      />
    </SchedulesViewLayout>
  );
}
