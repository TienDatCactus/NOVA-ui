import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";

import { formatMoney } from "~/lib/utils";
import type { RoomFilters } from "../../container/useRoomFilter";
import { ROOM_TYPE, RoomStatusEnum } from "~/services/types/room.types";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import type z from "zod";
const { RoomTypesListResponseSchema } = useRoomTypesSchema();
type RoomTypeList = z.infer<typeof RoomTypesListResponseSchema>;
interface RoomsFilterSidebarProps {
  filters: RoomFilters;
  onFilterChange: <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => void;
  onResetFilters: () => void;
  roomTypes: RoomTypeList;
}

function RoomsFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  roomTypes,
}: RoomsFilterSidebarProps) {
  const handleStatusToggle = (statusValue: string) => {
    const newStatus = filters.status.includes(statusValue)
      ? filters.status.filter((s) => s !== statusValue)
      : [...filters.status, statusValue];
    onFilterChange("status", newStatus);
  };

  const handleRoomTypeToggle = (roomType: string) => {
    const newRoomTypes = filters.roomTypes.includes(roomType)
      ? filters.roomTypes.filter((t) => t !== roomType)
      : [...filters.roomTypes, roomType];
    onFilterChange("roomTypes", newRoomTypes);
  };

  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    filters.status.length +
    filters.roomTypes.length +
    (filters.isOccupied !== null ? 1 : 0) +
    (filters.locked !== null ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 5000000 ? 1 : 0);

  return (
    <aside className="w-64 flex-shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bộ lọc</h2>
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

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Tìm kiếm
        </Label>
        <Input
          id="search"
          placeholder="Tên phòng, mã phòng..."
          value={filters.searchText}
          onChange={(e) => onFilterChange("searchText", e.target.value)}
          endIcon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Trạng thái</Label>
        <div className="space-y-2">
          {Object.entries(RoomStatusEnum).map(([key, value]) => (
            <div key={value} className="flex items-center gap-2">
              <Checkbox
                id={`status-${key}`}
                checked={filters.status.includes(key)}
                onCheckedChange={() => handleStatusToggle(key)}
              />
              <Label
                htmlFor={`status-${key}`}
                className="text-sm font-normal cursor-pointer"
              >
                {value}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Hạng phòng</Label>
        <div className="space-y-2">
          {roomTypes.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                id={`type-${item.id}`}
                checked={filters.roomTypes.includes(item.name)}
                onCheckedChange={() => handleRoomTypeToggle(item.name)}
              />
              <Label
                htmlFor={`type-${item.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {item.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Tình trạng sử dụng</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="occupied-yes"
              checked={filters.isOccupied === true}
              onCheckedChange={(checked) =>
                onFilterChange("isOccupied", checked ? true : null)
              }
            />
            <Label
              htmlFor="occupied-yes"
              className="text-sm font-normal cursor-pointer"
            >
              Đang sử dụng
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="occupied-no"
              checked={filters.isOccupied === false}
              onCheckedChange={(checked) =>
                onFilterChange("isOccupied", checked ? false : null)
              }
            />
            <Label
              htmlFor="occupied-no"
              className="text-sm font-normal cursor-pointer"
            >
              Chưa sử dụng
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Khoảng giá (VND/đêm)</Label>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              onFilterChange("priceRange", value as [number, number])
            }
            min={0}
            max={5000000}
            step={100000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatMoney(filters.priceRange[0]).vndFormatted}</span>
            <span>{formatMoney(filters.priceRange[1]).vndFormatted}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default RoomsFilterSidebar;
