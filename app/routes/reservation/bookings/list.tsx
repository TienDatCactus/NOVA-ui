import { format } from "date-fns";
import { useState } from "react";
import { BookingGridView } from "./components/booking-grid-view";
import BookingList from "./components/booking-list";
import useSearchBooking from "./container/booking-filter.hooks";
import { useBookings } from "./container/booking-query.hooks";
import BookingViewLayout from "./layouts/booking-view.layout";
import type { Route } from "./+types/list";

type ViewMode = "grid" | "list";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data, isPending, refetch } = useBookings({
    date: date ? format(date, "yyyy-MM-dd") : undefined,
  });
  const { filters, filteredBookings, handleFiltersChange, handleResetFilters } =
    useSearchBooking(data);

  return (
    <BookingViewLayout
      date={date}
      onDateChange={(date) => {
        setDate(date);
      }}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onResetFilters={handleResetFilters}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      {viewMode === "grid" ? (
        <BookingGridView
          bookings={filteredBookings}
          isLoading={isPending}
          refetch={refetch}
        />
      ) : (
        <BookingList
          bookings={filteredBookings}
          isLoading={isPending}
          refetch={refetch}
        />
      )}
    </BookingViewLayout>
  );
}
