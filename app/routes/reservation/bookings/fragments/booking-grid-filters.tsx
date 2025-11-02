import { Calendar, Filter, RotateCcw, Search, User } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarComponent } from "~/components/ui/calendar";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import type { AvailableBookingFilters } from "../container/available-booking-filter.hooks";
import { date } from "zod";
import { DatePicker } from "~/components/ui/date-picker";

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
    <div className="flex justify-between">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Tìm kiếm theo tên phòng, loại phòng..."
          value={filters.searchText}
          onChange={(e) => updateFilters("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
          className="w-80 bg-white"
        />

        <div className="flex gap-2">
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

          {/* End Date Picker */}
          <DatePicker
            mode="single"
            value={filters.endDate ?? undefined}
            onChange={(value) => updateFilters("endDate", value ?? null)}
            placeholder="Ngày trả phòng"
            className={cn("w-40", !filters.endDate && "text-muted-foreground")}
          />

          {/* Guests Input */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={10}
              placeholder="Số khách"
              value={filters.guests ?? ""}
              onChange={(e) =>
                updateFilters(
                  "guests",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              startAddon={<User className="text-muted-foreground" />}
              className="w-[150px]"
            />
          </div>

          {/* Active Filters Badge */}
        </div>
      </div>
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
  );
}
