import { type ReactNode } from "react";
import SearchRoom, { type BookingSearchFilters } from "../components/search";

interface BookingViewLayoutProps {
  children: ReactNode;
  filters: BookingSearchFilters;
  onFiltersChange: (filters: BookingSearchFilters) => void;
  onResetFilters: () => void;
  date?: Date | string;
  onDateChange?: (date: Date | undefined) => void;
}

function BookingViewLayout({
  children,
  filters,
  onFiltersChange,
  onResetFilters,
  date,
  onDateChange,
}: BookingViewLayoutProps) {
  return (
    <div className="space-y-4 p-4 ">
      <div className="flex flex-col gap-4">
        <SearchRoom
          date={date}
          onDateChange={onDateChange}
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
