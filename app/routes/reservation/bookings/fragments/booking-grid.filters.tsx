import { CalendarDays, Search, Users, X, Baby, Hotel } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { cn } from "~/lib/utils";
import type { AvailableRoomFilters } from "../container/available-booking-filter.hooks";

interface BookingGridFiltersProps {
  filters: AvailableRoomFilters;
  updateFilters: <K extends keyof AvailableRoomFilters>(
    key: K,
    value: AvailableRoomFilters[K]
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
    !!filters.CheckInDate ||
    !!filters.CheckOutDate ||
    (filters.Guests || 0) > 0;

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2">
      <div className="flex flex-1 flex-col lg:flex-row items-start lg:items-center gap-3 w-full">
        <div className="flex items-center gap-0 rounded-lg border bg-background p-1 shadow-sm w-full lg:w-auto overflow-x-auto">
          {/* Check-in Date */}
          <div className="flex items-center gap-2 px-2 min-w-[140px]">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <DatePicker
                mode="single"
                value={filters.CheckInDate ?? undefined}
                onChange={(value) =>
                  updateFilters("CheckInDate", value ?? null)
                }
                placeholder="Check-in"
                className="border-0 h-8 px-0 focus-visible:ring-0 bg-transparent w-full text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border mx-1" />

          {/* Check-out Date */}
          <div className="flex items-center gap-2 px-2 min-w-[140px]">
            <div className="flex-1">
              <DatePicker
                mode="single"
                value={filters.CheckOutDate ?? undefined}
                onChange={(value) =>
                  updateFilters("CheckOutDate", value ?? null)
                }
                placeholder="Check-out"
                className="border-0 h-8 px-0 focus-visible:ring-0 bg-transparent w-full text-sm font-medium shadow-none"
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border mx-1" />

          {/* Adults */}
          <div className="flex items-center gap-2 px-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Counter
              value={filters.Guests ?? 0}
              onChange={(value) =>
                updateFilters("Guests", value ? Number(value) : null)
              }
              className="border-0 w-32 shadow-none bg-transparent px-0"
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
