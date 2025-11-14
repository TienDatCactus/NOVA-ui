import CreateScheduleDialog from "./components/create-schedule-dialog";
import DeleteScheduleDialog from "./components/delete-schedule-dialog";
import UpdateScheduleDialog from "./components/update-schedule-dialog";
import SchedulesViewLayout from "./layouts/schedules-view.layout";
import { useSchedulesContainer } from "./container/container.hooks";
import ScheduleCalendarView from "./components/schedule-calendar-view";

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
    handleExport,
  } = useSchedulesContainer();

  const handleAddStaff = (shiftId: string, date: string) => {
    // Open create dialog with pre-filled date and shift
    setCreateDialogOpen(true);
    // TODO: Pre-fill form with date and shift
  };

  return (
    <SchedulesViewLayout
      filterState={filterState}
      onFilterChange={updateFilter}
      onResetFilter={resetFilter}
      totalShifts={shifts.length}
      onAddSchedule={() => setCreateDialogOpen(true)}
      onExport={handleExport}
      isExporting={isExporting}
      currentWeekStart={currentWeekStart}
      weekEnd={weekEnd}
      onPrevWeek={handlePrevWeek}
      onNextWeek={handleNextWeek}
      onToday={handleToday}
    >
      {isPending ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      ) : (
        <ScheduleCalendarView
          shifts={shifts}
          workShifts={workShifts}
          weekStart={currentWeekStart}
          onAddStaff={handleAddStaff}
          onDeleteStaff={handleOpenDeleteDialog}
          onEditStaff={handleOpenUpdateDialog}
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
    </SchedulesViewLayout>
  );
}
