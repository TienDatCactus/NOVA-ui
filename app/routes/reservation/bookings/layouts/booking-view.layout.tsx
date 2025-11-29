import { type ReactNode } from "react";
import { Grid3x3, List, LayoutGrid } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import SearchRoom, { type BookingSearchFilters } from "../components/search";
import { Separator } from "~/components/ui/separator";

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
    <div className="flex flex-col h-full bg-muted/5 min-h-screen">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all">
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <SearchRoom
            date={date}
            onDateChange={onDateChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onReset={onResetFilters}
          />
        </div>

        {/* Right: View Controls */}
        {onViewModeChange && (
          <div className="flex items-center gap-3 shrink-0">
            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Segmented Control Design */}
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
                <span className="text-xs font-medium">List</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* === MAIN CONTENT AREA === */}
      <main className="flex-1 p-6 overflow-y-auto scroll-smooth">
        <div className="max-w-[1920px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default BookingViewLayout;
