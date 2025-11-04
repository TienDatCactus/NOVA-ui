import { ListFilterPlus, Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { RoomTypeFilters } from "../../container/room-types/filter.hooks";

interface RoomTypesFilterSidebarProps {
  filters: RoomTypeFilters;
  onFilterChange: <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => void;
  onResetFilters: () => void;
}

export function RoomTypesFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: RoomTypesFilterSidebarProps) {
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
      <Card className="p-4 shadow-sm">
        <CardContent className="space-y-2 px-0">
          <Label htmlFor="room-types-search">Tìm kiếm</Label>
          <Input
            id="room-types-search"
            placeholder="Tìm kiếm..."
            value={filters.searchText}
            onChange={(e) => onFilterChange("searchText", e.target.value)}
            startAddon={<Search className=" h-4 w-4 text-muted-foreground" />}
          />
        </CardContent>

        <CardContent className="space-y-2 px-0">
          <Label>Trạng thái</Label>
          <RadioGroup
            value={filters.activeFilter}
            onValueChange={(value) =>
              onFilterChange(
                "activeFilter",
                value as RoomTypeFilters["activeFilter"]
              )
            }
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="all"
                id="all"
                className="border-primary focus-visible:border-primary border-dashed"
              />
              <Label htmlFor="all">Tất cả</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value="active"
                id="active"
                className="border-primary focus-visible:border-primary border-dashed"
              />
              <Label htmlFor="active">Đang hoạt động</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </aside>
  );
}
