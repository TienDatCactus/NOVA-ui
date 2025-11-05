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
import type { RoomFilters } from "../../container/rooms/filter.hooks";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { RoomStatusEnum } from "~/services/types/room.types";

interface RoomsCommandBarProps {
  filters: RoomFilters;
  updateFilter: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  resetFilters: () => void;
  roomTypes: RoomTypesListItemDto[];
}

export default function RoomsCommandBar({
  filters,
  updateFilter,
  resetFilters,
  roomTypes = [],
}: RoomsCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.typeId ? 1 : 0);

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
            Bộ lọc phòng
          </Label>
          <Input
            placeholder="Tìm kiếm theo tên, mã phòng..."
            value={filters.searchText}
            className="bg-white"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          
          {/* Room Type Filter */}
          <Select
            value={filters.typeId || "all"}
            onValueChange={(value) =>
              updateFilter("typeId", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn hạng phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hạng phòng</SelectItem>
              {roomTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilter("status", value === "all" ? undefined : (value as RoomFilters["status"]))
            }
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trạng thái</SelectItem>
              {Object.entries(RoomStatusEnum).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  );
}
