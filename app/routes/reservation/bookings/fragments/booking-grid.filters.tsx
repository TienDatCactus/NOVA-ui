import { CalendarDays, Search, Users, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { cn } from "~/lib/utils";
import type { AvailableBookingFilters } from "../container/available-booking-filter.hooks";

interface BookingGridFiltersProps {
  filters: AvailableBookingFilters;
  updateFilters: <K extends keyof AvailableBookingFilters>(
    key: K,
    value: AvailableBookingFilters[K]
  ) => void;
  resetFilters: () => void;
}

export default function BookingGridFilters({
  filters,
  updateFilters,
  resetFilters,
}: BookingGridFiltersProps) {
  // Logic kiểm tra có filter nào đang active không
  const hasActiveFilters =
    filters.searchText !== "" ||
    !!filters.startDate ||
    !!filters.endDate ||
    (filters.guests || 0) > 0;

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2">
      {/* LEFT: FILTER GROUPS */}
      <div className="flex flex-1 flex-col lg:flex-row items-start lg:items-center gap-3 w-full">
        {/* 1. Search Input (Standalone) */}
        <div className="relative w-full lg:w-[320px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder="Tìm theo tên phòng, hạng phòng..."
            value={filters.searchText}
            onChange={(e) => updateFilters("searchText", e.target.value)}
            className="pl-9 h-10 bg-background border-input/60 focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>

        {/* 2. Context Group (Dates + Guests) */}
        {/* Gom nhóm lại tạo cảm giác như một thanh công cụ thống nhất */}
        <div className="flex items-center gap-0 rounded-lg border bg-background p-1 shadow-sm w-full lg:w-auto overflow-x-auto">
          {/* Start Date */}
          <div className="flex items-center gap-2 px-2 min-w-[140px]">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <DatePicker
                mode="single"
                value={filters.startDate ?? undefined}
                onChange={(value) => updateFilters("startDate", value ?? null)}
                placeholder="Check-in"
                className="border-0 h-8 px-0 focus-visible:ring-0 bg-transparent w-full text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border mx-1" />

          {/* End Date */}
          <div className="flex items-center gap-2 px-2 min-w-[140px]">
            <div className="flex-1">
              <DatePicker
                mode="single"
                value={filters.endDate ?? undefined}
                onChange={(value) => updateFilters("endDate", value ?? null)}
                placeholder="Check-out"
                className="border-0 h-8 px-0 focus-visible:ring-0 bg-transparent w-full text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border mx-1" />

          {/* Guests */}
          <div className="flex items-center gap-2 px-3">
            <Users className="h-4 w-4 text-muted-foreground " />
            <Counter
              value={filters.guests ?? 0}
              onChange={(value) =>
                updateFilters("guests", value ? Number(value) : null)
              }
              className="border-0  w-40 shadow-none bg-transparent px-0"
            />
          </div>
        </div>
      </div>

      {/* RIGHT: RESET ACTION */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 px-3"
        >
          <X className="h-4 w-4 mr-2" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
