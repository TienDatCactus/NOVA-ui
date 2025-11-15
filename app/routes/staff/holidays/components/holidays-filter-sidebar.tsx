import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Search } from "lucide-react";
import type { HolidayFilterState } from "../container/filter.hooks";

interface HolidaysFilterSidebarProps {
  filterState: HolidayFilterState;
  updateFilter: (updates: Partial<HolidayFilterState>) => void;
}

export default function HolidaysFilterSidebar({
  filterState,
  updateFilter,
}: HolidaysFilterSidebarProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">Tìm kiếm</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên ngày nghỉ..."
              value={filterState.search}
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
