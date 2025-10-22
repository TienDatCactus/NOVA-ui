import type { Route } from "./+types/list";
import BookingList from "./components/booking-list";
import useBookings from "./container/useBookings";
import useSearchBooking from "./container/useSearchBooking";
import BookingViewLayout from "./layouts/booking-view.layout";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data, isPending, refetch } = useBookings();
  const { filters, filteredBookings, handleFiltersChange, handleResetFilters } =
    useSearchBooking(data);
  return (
    <BookingViewLayout
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
