import { useMemo, useState } from "react";
import type { Route } from "./+types/staff-shifts";
import UnifiedScheduleTable from "./components/unified-schedule-table";
import { useScheduleFilter } from "./container/filter.hooks";
import SchedulesViewLayout from "./layouts/schedules-view.layout";
import { useActiveWorkShiftList } from "~/routes/work-shifts/container/query.hooks";
import {
  useStaffShiftList,
  useStaffAttendanceList,
} from "./container/query.hooks";
import { addDays, startOfWeek } from "date-fns";

export default function Schedules({}: Route.ComponentProps) {
  const { filters, updateFilters, resetFilters } = useScheduleFilter();
  const [viewMode, setViewMode] = useState<"shift" | "staff">("shift");

  // Queries
  const { data: workShifts } = useActiveWorkShiftList();
  const { data: shifts } = useStaffShiftList({
    from: filters.fromDate,
    to: filters.toDate,
    staffId: filters.selectedStaffId,
  });
  const { data: attendances } = useStaffAttendanceList({
    from: filters.fromDate,
    to: filters.toDate,
    staffId: filters.selectedStaffId,
    status: filters.attendanceStatus,
  });

  const weekDays = useMemo(() => {
    const weekStart = filters.fromDate
      ? startOfWeek(new Date(filters.fromDate), { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [filters.fromDate]);

  return (
    <SchedulesViewLayout
      filters={filters}
      updateFilters={updateFilters}
      resetFilters={resetFilters}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      totalShifts={shifts?.length || 0}
    >
      <UnifiedScheduleTable
        viewMode={viewMode}
        workShifts={workShifts || []}
        shifts={shifts || []}
        attendances={attendances || []}
        weekDays={weekDays}
      />
    </SchedulesViewLayout>
  );
}
