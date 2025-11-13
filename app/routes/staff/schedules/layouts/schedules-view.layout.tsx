import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ScheduleFilterSidebar from "../components/schedule-filter-sidebar";
import type { ScheduleFilterState } from "../container/filter.hooks";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface SchedulesViewLayoutProps {
  filterState: ScheduleFilterState;
  onFilterChange: (updates: Partial<ScheduleFilterState>) => void;
  onResetFilter: () => void;
  totalShifts: number;
  onAddSchedule: () => void;
  currentWeekStart: Date;
  weekEnd: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  children: ReactNode;
}

export default function SchedulesViewLayout({
  filterState,
  onFilterChange,
  onResetFilter,
  totalShifts,
  onAddSchedule,
  currentWeekStart,
  weekEnd,
  onPrevWeek,
  onNextWeek,
  onToday,
  children,
}: SchedulesViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4 min-h-screen">
      <ScheduleFilterSidebar
        filterState={filterState}
        updateFilter={onFilterChange}
        onResetFilter={onResetFilter}
      />

      <main className="flex-1 space-y-4 min-w-0 overflow-x-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Lịch làm việc</h1>
              <Badge variant="secondary" className="text-sm">
                {totalShifts} ca làm
              </Badge>
            </div>
            <Button onClick={onAddSchedule}>
              <Plus className="mr-2 h-4 w-4" />
              Xuất file
            </Button>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={onPrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium px-4">
                Tuần {format(currentWeekStart, "w", { locale: vi })} -{" "}
                {format(currentWeekStart, "dd/MM", { locale: vi })} đến{" "}
                {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
              </div>
              <Button variant="outline" size="icon" onClick={onNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onToday}>
                Tuần này
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onAddSchedule}>
                Xem theo ca
              </Button>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
