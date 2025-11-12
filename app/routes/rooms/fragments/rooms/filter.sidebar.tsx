import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

import type z from "zod";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import type { RoomFilters } from "../../container/rooms/filter.hooks";
const { RoomTypesListResponseSchema } = RoomTypesSchema;
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
  const handleRoomTypeToggle = (typeId: string) => {
    const newRoomType = filters.typeId === typeId ? undefined : typeId;
    onFilterChange("typeId", newRoomType);
  };

  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.isOccupied !== null ? 1 : 0);

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
        <CardContent className="px-0">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Tìm kiếm
            </Label>
            <Input
              id="search"
              placeholder="Tên phòng, mã phòng..."
              value={filters.searchText}
              onChange={(e) => onFilterChange("searchText", e.target.value)}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>
        <Separator />
        <CardContent className="px-0 rounded-md">
          <Collapsible className="space-y-3">
            <CollapsibleTrigger>
              <Label className="text-sm font-medium" htmlFor="rooms-status">
                Trạng thái
              </Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <RadioGroup
                id="rooms-status"
                value={filters.status || ""}
                onValueChange={(value) => {
                  onFilterChange("status", value as RoomFilters["status"]);
                }}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="" id="status-all" />
                  <Label
                    htmlFor="status-all"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Tất cả
                  </Label>
                </div>
                {Object.entries(RoomStatusEnum).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <RadioGroupItem id={`status-${key}`} value={key} />
                    <Label
                      htmlFor={`status-${key}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <Separator />
        <CardContent className="px-0 rounded-md">
          <Collapsible className="space-y-3">
            <CollapsibleTrigger>
              <Label className="text-sm font-medium">Hạng phòng</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {roomTypes.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Switch
                    id={`type-${item.id}`}
                    checked={filters.typeId === item.id}
                    onCheckedChange={() => handleRoomTypeToggle(item.id)}
                  />
                  <Label
                    htmlFor={`type-${item.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {item.name}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        {/* <CardContent className="px-0 rounded-md ">
          <Collapsible>
            <CollapsibleTrigger className="">
              <Label className="text-sm font-medium">Tình trạng sử dụng</Label>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Slider id="price-range" />
                  <Label
                    htmlFor="occupied-yes"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Đang sử dụng
                  </Label>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent> */}
      </Card>
    </aside>
  );
}

export default RoomsFilterSidebar;
