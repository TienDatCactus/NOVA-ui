import { Filter, RotateCcw, Search, User } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import { cn, handleLimitInput } from "~/lib/utils";
import type { AvailableBookingFilters } from "../container/available-booking-filter.hooks";
import { Label } from "~/components/ui/label";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Card, CardContent } from "~/components/ui/card";

interface BookingGridFiltersProps {
  filters: AvailableBookingFilters;
  updateFilters: <K extends keyof AvailableBookingFilters>(
    key: K,
    value: AvailableBookingFilters[K]
  ) => void;
  resetFilters: () => void;
}

/**
 * Filter bar cho booking grid
 * Bao gồm: search, date range, guests filters
 */
export default function BookingGridFilters({
  filters,
  updateFilters,
  resetFilters,
}: BookingGridFiltersProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.guests ? 1 : 0);

  return (
    <Card className="p-4 shadow">
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-0">
        <div className="flex gap-2">
          <div>
            <Label htmlFor="search">Tìm kiếm</Label>
            <Input
              placeholder="Tìm kiếm theo tên phòng, loại phòng..."
              value={filters.searchText}
              onChange={(e) => updateFilters("searchText", e.target.value)}
              startAddon={<Search className="text-muted-foreground" />}
              className="w-80 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <DatePicker
                mode="single"
                value={filters.startDate ?? undefined}
                onChange={(value) => updateFilters("startDate", value ?? null)}
                placeholder="Ngày nhận phòng"
                className={cn(
                  "w-40",
                  !filters.startDate && "text-muted-foreground"
                )}
              />
            </div>

            {/* End Date Picker */}
            <div>
              <Label htmlFor="endDate">Ngày bắt đầu</Label>
              <DatePicker
                mode="single"
                value={filters.endDate ?? undefined}
                onChange={(value) => updateFilters("endDate", value ?? null)}
                placeholder="Ngày trả phòng"
                className={cn(
                  "w-40",
                  !filters.endDate && "text-muted-foreground"
                )}
              />
            </div>

            {/* Guests Input */}
            <div>
              <Label htmlFor="guests">Ngày bắt đầu</Label>
              <Counter
                onInput={handleLimitInput}
                value={filters.guests ?? 0}
                onChange={(value) =>
                  updateFilters("guests", value ? Number(value) : null)
                }
                className="w-[150px]"
              />
            </div>

            {/* Active Filters Badge */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              <Filter className="h-3 w-3 mr-1" />
              {activeFiltersCount} bộ lọc
            </Badge>
          )}
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={resetFilters}>
              Đặt lại
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
