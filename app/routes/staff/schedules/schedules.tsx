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

export function clientLoader() {
  return { title: "Lịch làm việc - NOVA" };
}

export default function Schedules() {
  const {
    shifts,
    workShifts,
    isPending,
    filterState,
    updateFilter,
    resetFilter,
    createDialogOpen,
    setCreateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    updateDialogOpen,
    setUpdateDialogOpen,
    selectedShift,
    handleCreateSuccess,
    handleDeleteSuccess,
    handleUpdateSuccess,
    handleOpenDeleteDialog,
    handleOpenUpdateDialog,
    currentWeekStart,
    weekEnd,
    handlePrevWeek,
    handleNextWeek,
    handleToday,
    isExporting,
    handleExportMatrix,
    handleExportForm2,
  } = useSchedulesContainer();

  // View mode state
  const [viewMode, setViewMode] = useState<"shift" | "staff">("shift");

  // Attendance dialog states
  const [markAbsentDialogOpen, setMarkAbsentDialogOpen] = useState(false);
  const [markAttendanceDialogOpen, setMarkAttendanceDialogOpen] =
    useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<StaffAttendanceListItem | null>(null);

  // Fetch attendance data for the week
  const { data: attendanceData, refetch: refetchAttendance } = useQuery({
    queryKey: [
      "staff-attendances",
      format(currentWeekStart, "yyyy-MM-dd"),
      format(weekEnd, "yyyy-MM-dd"),
    ],
    queryFn: async () => {
      const resp = await StaffAttendanceService.getStaffAttendanceList({
        from: format(currentWeekStart, "yyyy-MM-dd"),
        to: format(weekEnd, "yyyy-MM-dd"),
        ...(filterState.selectedStaffId && {
          staffId: filterState.selectedStaffId,
        }),
      });
      return resp;
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleAddStaff = (shiftId: string, date: string) => {
    setCreateDialogOpen(true);
  };

  const handleOpenMarkAbsentDialog = (attendance: StaffAttendanceListItem) => {
    setSelectedAttendance(attendance);
    setMarkAbsentDialogOpen(true);
  };

  const handleOpenMarkAttendanceDialog = (
    attendance: StaffAttendanceListItem
  ) => {
    setSelectedAttendance(attendance);
    setMarkAttendanceDialogOpen(true);
  };

  const handleMarkAbsentSuccess = () => {
    setSelectedAttendance(null);
    setMarkAbsentDialogOpen(false);
    refetchAttendance();
  };

  const handleMarkAttendanceSuccess = () => {
    setSelectedAttendance(null);
    setMarkAttendanceDialogOpen(false);
    refetchAttendance();
  };

  // Count only shifts with active work shifts
  const activeShiftsCount = shifts.filter((shift) => {
    const workShift = workShifts.find((ws) => ws.id === shift.shiftId);
    return workShift?.active === true;
  }).length;

  return (
    <SchedulesViewLayout
      filterState={filterState}
      onFilterChange={updateFilter}
      onResetFilter={resetFilter}
      totalShifts={activeShiftsCount}
      onAddSchedule={() => setCreateDialogOpen(true)}
      onExportMatrix={handleExportMatrix}
      onExportForm2={handleExportForm2}
      isExporting={isExporting}
      currentWeekStart={currentWeekStart}
      weekEnd={weekEnd}
      onPrevWeek={handlePrevWeek}
      onNextWeek={handleNextWeek}
      onToday={handleToday}
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
          weekStart={currentWeekStart}
          onDeleteStaff={handleOpenDeleteDialog}
          onEditStaff={handleOpenUpdateDialog}
          onMarkAttendance={handleOpenMarkAttendanceDialog}
          onMarkAbsent={handleOpenMarkAbsentDialog}
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
