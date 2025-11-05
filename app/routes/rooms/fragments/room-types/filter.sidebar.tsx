import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
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
  const [searchOpen, setSearchOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(true);

  const activeFiltersCount =
    (filters.searchText ? 1 : 0) + (filters.activeFilter !== "all" ? 1 : 0);

  return (
    <aside className="w-72 flex-shrink-0">
      <Card className="p-4 shadow-sm">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Bộ lọc hạng phòng</Label>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-7 text-xs gap-1 -mr-2"
              >
                <X className="h-3 w-3" />
                Xóa ({activeFiltersCount})
              </Button>
            )}
          </div>

          <Separator />

          {/* Search Section */}
          <Collapsible open={searchOpen} onOpenChange={setSearchOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:underline">
              <Label className="text-sm font-medium cursor-pointer">
                Tìm kiếm
              </Label>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  searchOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              <Input
                id="room-types-search"
                placeholder="Tìm theo mã hoặc tên..."
                value={filters.searchText}
                onChange={(e) => onFilterChange("searchText", e.target.value)}
                startAddon={<Search className="h-4 w-4" />}
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Status Section */}
          <Collapsible open={statusOpen} onOpenChange={setStatusOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:underline">
              <Label className="text-sm font-medium cursor-pointer">
                Trạng thái
              </Label>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  statusOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
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
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    Tất cả
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active" className="cursor-pointer">
                    Đang hoạt động
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive" className="cursor-pointer">
                    Ngừng hoạt động
                  </Label>
                </div>
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </aside>
  );
}
