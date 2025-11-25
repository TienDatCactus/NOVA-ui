import WorkShiftsDataTable from "./components/work-shifts-list";
import { useWorkShiftFilter } from "./container/filter.hooks";
import { useWorkShiftList } from "./container/query.hooks";
import WorkShiftsViewLayout from "./layouts/work-shifts-view.layout";

export function clientLoader() {
  return { title: "Ca làm việc - NOVA" };
}

export default function WorkShifts() {
  const { filters, updateFilter, resetFilters } = useWorkShiftFilter();
  const { data: workshifts, isPending } = useWorkShiftList();
  return (
    <WorkShiftsViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalWorkShifts={workshifts?.length || 0}
    >
      <WorkShiftsDataTable
        workShifts={workshifts ?? []}
        isLoading={isPending}
      />
    </WorkShiftsViewLayout>
  );
}
