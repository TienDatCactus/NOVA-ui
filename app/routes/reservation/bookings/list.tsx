import { useState } from "react";
import type { Route } from "./+types/list";
import BookingList from "./components/booking-list";
import useSearchBooking from "./container/booking-filter.hooks";
import { useBookings } from "./container/booking-query.hooks";
import BookingViewLayout from "./layouts/booking-view.layout";
import { format } from "date-fns";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
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
    >
      <BookingList
        bookings={filteredBookings}
        isLoading={isPending}
        refetch={refetch}
      />
    </BookingViewLayout>
  );
}
