import CreateHolidayDialog from "./components/holiday-create-dialog";
import UpdateHolidayDialog from "./components/holiday-update-dialog";
import DeleteHolidayDialog from "./components/holiday-delete-dialog";
import HolidaysViewLayout from "./layouts/holidays-view.layout";
import { useHolidaysContainer } from "./container/container.hooks";
import HolidaysList from "./components/holidays-list";

export function clientLoader() {
  return { title: "Ngày nghỉ lễ - NOVA" };
}

export default function Holidays() {
  const {
    holidays,
    isPending,
    filterState,
    updateFilter,
    resetFilter,
    createDialogOpen,
    setCreateDialogOpen,
    updateDialogOpen,
    setUpdateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedHoliday,
    handleCreateSuccess,
    handleUpdateSuccess,
    handleDeleteSuccess,
  } = useHolidaysContainer();

  return (
    <HolidaysViewLayout
      filterState={filterState}
      onFilterChange={updateFilter}
      onResetFilter={resetFilter}
      totalHolidays={holidays.length}
      onAddHoliday={() => setCreateDialogOpen(true)}
    >
      <HolidaysList
        holidays={holidays}
        isLoading={isPending}
        onSuccess={handleUpdateSuccess}
      />

      {/* Dialogs */}
      <CreateHolidayDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <UpdateHolidayDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        holiday={selectedHoliday}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteHolidayDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        holiday={selectedHoliday}
        onSuccess={handleDeleteSuccess}
      />
    </HolidaysViewLayout>
  );
}
