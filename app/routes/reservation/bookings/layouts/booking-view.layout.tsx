import { type ReactNode } from "react";
import { Grid3x3, List, LayoutGrid } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import type { BookingSearchFilters } from "../container/booking-filter.hooks";
import SearchRoom from "../components/search";

type ViewMode = "grid" | "list";

interface BookingViewLayoutProps {
  children: ReactNode;
  filters: BookingSearchFilters;
  updateFilters: <K extends keyof BookingSearchFilters>(
    key: K,
    value: BookingSearchFilters[K]
  ) => void;
  resetFilters: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

function BookingViewLayout({
  children,
  filters,
  updateFilters,
  resetFilters,
  viewMode = "grid",
  onViewModeChange,
}: BookingViewLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-muted/5 min-h-screen">
      <div className="border-b px-6 py-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all">
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <SearchRoom
            filters={filters}
            updateFilters={updateFilters}
            resetFilters={resetFilters}
          />
        </div>

        {/* Right: View Controls */}
        {onViewModeChange && (
          <div className="flex items-center gap-3 shrink-0">
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center p-1 rounded-lg bg-muted/50 border shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-md transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                onClick={() => onViewModeChange("grid")}
                title="Chế độ Lưới"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Lưới</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-md transition-all duration-200",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                onClick={() => onViewModeChange("list")}
                title="Chế độ Danh sách"
              >
                <List className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Danh sách</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <main className="flex-1 p-6 overflow-y-auto ">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default BookingViewLayout;
