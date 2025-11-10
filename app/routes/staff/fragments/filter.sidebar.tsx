import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
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
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) + (filters.includeInactive ? 1 : 0);

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
              placeholder="Mã, tên, SĐT, email, phòng ban..."
              value={filters.searchText}
              onChange={(e) => onFilterChange("searchText", e.target.value)}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-inactive" className="text-sm font-medium">
                Hiển thị nhân sự đã nghỉ việc
              </Label>
              <Switch
                id="include-inactive"
                checked={filters.includeInactive}
                onCheckedChange={(checked) =>
                  onFilterChange("includeInactive", checked)
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {filters.includeInactive
                ? "Đang hiển thị cả nhân sự đã nghỉ việc"
                : "Chỉ hiển thị nhân sự đang làm việc"}
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
