import type { ReactNode } from "react";
import HolidaysFilterSidebar from "../components/holidays-filter-sidebar";
import type { HolidayFilterState } from "../container/filter.hooks";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface HolidaysViewLayoutProps {
  filterState: HolidayFilterState;
  onFilterChange: (updates: Partial<HolidayFilterState>) => void;
  onResetFilter: () => void;
  totalHolidays: number;
  onAddHoliday: () => void;
  children: ReactNode;
}

export default function HolidaysViewLayout({
  filterState,
  onFilterChange,
  onResetFilter,
  totalHolidays,
  onAddHoliday,
  children,
}: HolidaysViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <HolidaysFilterSidebar
        filterState={filterState}
        updateFilter={onFilterChange}
      />
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý ngày nghỉ lễ</h1>
              <Badge variant="secondary" className="text-sm">
                {totalHolidays} ngày nghỉ
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onAddHoliday}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm ngày nghỉ
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Quản lý các ngày nghỉ lễ trong khách sạn
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
