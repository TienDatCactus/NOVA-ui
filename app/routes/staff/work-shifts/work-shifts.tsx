import CreateWorkShiftDialog from "./components/work-shift-create-dialog";
import WorkShiftsViewLayout from "./layouts/work-shifts-view.layout";
import useWorkShiftsContainer from "./container/container.hooks";
import WorkShiftsDataTable from "./components/work-shifts-list";
import { useWorkShiftList } from "./container/query.hooks";

export function clientLoader() {
  return { title: "Ca làm việc - NOVA" };
}

export default function WorkShifts() {
  const { refetch } = useWorkShiftList();
  const {
    workShifts,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    stats,
    createDialogOpen,
    setCreateDialogOpen,
  } = useWorkShiftsContainer();

  const hasFilters = !!(filters.searchQuery || filters.isActive !== "all");

  return (
    <WorkShiftsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalWorkShifts={stats.total}
      activeWorkShifts={stats.active}
      inactiveWorkShifts={stats.inactive}
      onAddWorkShift={() => setCreateDialogOpen(true)}
    >
      <WorkShiftsDataTable
        workShifts={workShifts}
        isLoading={isPending}
        hasFilters={hasFilters}
        onAddWorkShift={() => setCreateDialogOpen(true)}
        onSuccess={refetch}
      />

      {/* Dialogs */}
      <CreateWorkShiftDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </WorkShiftsViewLayout>
  );
}
