import type { ReactNode } from "react";
import { Switch } from "~/components/ui/switch";
import type { WorkShiftFilters } from "../container/filter.hooks";
import { Label } from "~/components/ui/label";

interface WorkShiftsViewLayoutProps {
  filters: WorkShiftFilters;
  updateFilter: <K extends keyof WorkShiftFilters>(
    key: K,
    value: WorkShiftFilters[K]
  ) => void;
  resetFilters: () => void;
  totalWorkShifts: number;
  children: ReactNode;
}

export default function WorkShiftsViewLayout({
  filters,
  updateFilter,
  resetFilters,
  children,
  totalWorkShifts,
}: WorkShiftsViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý ca làm việc</h1>
            <p className="text-sm text-muted-foreground">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalWorkShifts}
              </span>{" "}
              ca
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
