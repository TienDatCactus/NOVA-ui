import type { ReactNode } from "react";
import WorkShiftsFilterSidebar from "../fragments/filter.sidebar";
import type { WorkShiftFilters } from "../container/filter.hooks";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface WorkShiftsViewLayoutProps {
  filters: WorkShiftFilters;
  onFilterChange: <K extends keyof WorkShiftFilters>(
    key: K,
    value: WorkShiftFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalWorkShifts: number;
  activeWorkShifts: number;
  inactiveWorkShifts: number;
  onAddWorkShift: () => void;
  children: ReactNode;
}

export default function WorkShiftsViewLayout({
  filters,
  onFilterChange,
  onResetFilters,
  totalWorkShifts,
  activeWorkShifts,
  inactiveWorkShifts,
  onAddWorkShift,
  children,
}: WorkShiftsViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <WorkShiftsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý ca làm việc</h1>
              <Badge variant="secondary" className="text-sm">
                {totalWorkShifts} ca
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onAddWorkShift}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ca làm việc
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Quản lý các ca làm việc trong khách sạn (Sáng/Chiều/Tối)
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
