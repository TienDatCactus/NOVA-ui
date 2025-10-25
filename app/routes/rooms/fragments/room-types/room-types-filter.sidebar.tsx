import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { RoomTypeStatus } from "~/services/types/room-types.types";
import type { RoomTypeFilters } from "../../container/useRoomTypeFilter";

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
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card h-fit ">
      <div className="space-y-2">
        <Label>Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={filters.searchText}
            onChange={(e) => onFilterChange("searchText", e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <RadioGroup
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange(
              "activeFilter",
              value as "all" | "active" | "inactive"
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
            <Label htmlFor="active">Hoạt động</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="inactive"
              id="inactive"
              className="border-primary focus-visible:border-primary border-dashed"
            />
            <Label htmlFor="inactive">Không hoạt động</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
