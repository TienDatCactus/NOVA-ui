import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import type { RoomTypeFilters } from "../../container/room-types/filter.hooks";

interface RoomTypesCommandBarProps {
  filters: RoomTypeFilters;
  updateFilter: <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => void;
  resetFilters: () => void;
}

export default function RoomTypesCommandBar({
  filters,
  updateFilter,
  resetFilters,
}: RoomTypesCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText ? 1 : 0) + (filters.activeFilter !== "all" ? 1 : 0);

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
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
            Bộ lọc hạng phòng
          </Label>
          <Input
            placeholder="Tìm kiếm theo mã, tên hạng phòng..."
            value={filters.searchText}
            className="bg-white"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.activeFilter}
            onValueChange={(value) =>
              updateFilter(
                "activeFilter",
                value as RoomTypeFilters["activeFilter"]
              )
            }
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  );
}
