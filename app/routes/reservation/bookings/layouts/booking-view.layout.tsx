import { type ReactNode } from "react";
import SearchRoom, { type BookingSearchFilters } from "../fragments/search";

interface BookingViewLayoutProps {
  children: ReactNode;
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onResetFilters: () => void;
}

function BookingViewLayout({
  children,
  filters,
  onFiltersChange,
  onResetFilters,
}: BookingViewLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <SearchRoom
          filters={filters}
          onFiltersChange={onFiltersChange}
          onReset={onResetFilters}
        />
      </div>
      <main className="rounded-sm">{children}</main>
    </div>
  );
}

export default BookingViewLayout;
