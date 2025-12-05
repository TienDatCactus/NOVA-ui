import { format } from "date-fns";
import type { Route } from "./+types/grid";
import BookingGrid from "./components/booking-grid";
import { useAvailableRoomsFilter } from "./container/available-booking-filter.hooks";
import useBookingFilters from "./container/booking-filter.hooks";
import { useAvailableRooms } from "./container/booking-query.hooks";
import BookingGridFilters from "./fragments/booking-grid.filters";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { filters, resetFilters, updateFilter } = useAvailableRoomsFilter();

  const {
    data: rooms,
    refetch,
    isLoading,
  } = useAvailableRooms({
    params: {
      CheckInDate: format(filters.CheckInDate ?? new Date(), "yyyy-MM-dd"),
      CheckOutDate: format(filters.CheckOutDate ?? new Date(), "yyyy-MM-dd"),
      Guests: filters.Guests ?? 1,
    },
    enabled: true,
  });

  return (
    <div className="flex p-4  flex-col space-y-4 h-full">
      <BookingGridFilters
        filters={filters}
        updateFilters={updateFilter}
        resetFilters={resetFilters}
      />

      <div className="flex-1 overflow-auto">
        <BookingGrid rooms={rooms} isLoading={isLoading} refetch={refetch} />
      </div>
    </div>
  );
}
