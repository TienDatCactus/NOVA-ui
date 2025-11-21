import { type ReactNode } from "react";
import SearchRoom, { type BookingSearchFilters } from "../components/search";
import { Button } from "~/components/ui/button";
import { Grid3x3, List } from "lucide-react";
import { cn } from "~/lib/utils";

type ViewMode = "grid" | "list";

interface BookingViewLayoutProps {
  children: ReactNode;
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onResetFilters: () => void;
  date?: Date | string;
  onDateChange?: (date: Date | undefined) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function BookingViewLayout({
  children,
  filters,
  onFiltersChange,
  onResetFilters,
  date,
  onDateChange,
  viewMode = "grid",
  onViewModeChange,
}: BookingViewLayoutProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <SearchRoom
              date={date}
              onDateChange={onDateChange}
              filters={filters}
              onFiltersChange={onFiltersChange}
              onReset={onResetFilters}
            />
          </div>
          {onViewModeChange && (
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={cn("h-8 px-3")}
                onClick={() => onViewModeChange("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="ml-2 max-sm:hidden">Lưới</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={cn("h-8 px-3")}
                onClick={() => onViewModeChange("list")}
              >
                <List className="h-4 w-4" />
                <span className="ml-2 max-sm:hidden">Danh sách</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <main className="rounded-sm">{children}</main>
    </div>
  );
}

export default BookingViewLayout;
