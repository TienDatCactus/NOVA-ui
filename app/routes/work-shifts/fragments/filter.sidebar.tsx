import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { WorkShiftFilters } from "../container/filter.hooks";

interface WorkShiftsFilterSidebarProps {
  filters: WorkShiftFilters;
  onFilterChange: <K extends keyof WorkShiftFilters>(
    key: K,
    value: WorkShiftFilters[K]
  ) => void;
  onResetFilters: () => void;
}

export default function WorkShiftsFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: WorkShiftsFilterSidebarProps) {
  const activeFiltersCount = filters.searchQuery !== "" ? 1 : 0;

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>
      <Card className="p-4 h-fit shadow-sm">
        <div className="flex flex-col gap-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Bộ lọc ca làm việc
          </Label>
          <Input
            placeholder="Mã, tên ca làm việc..."
            value={filters.searchQuery}
            className="bg-background"
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
        </div>
      </Card>
    </aside>
  );
}
