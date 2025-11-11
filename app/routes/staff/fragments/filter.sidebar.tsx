import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { StaffFilters } from "../container/filter.hooks";

interface StaffFilterSidebarProps {
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => void;
  onResetFilters: () => void;
}

export default function StaffFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: StaffFilterSidebarProps) {
  const activeFiltersCount = filters.searchText ? 1 : 0;

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

      <Card className="p-3 shadow-sm">
        <CardContent className="px-0">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Tìm kiếm
            </Label>
            <Input
              id="search"
              placeholder="Mã, tên..."
              value={filters.searchText}
              onChange={(e) => onFilterChange("searchText", e.target.value)}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
