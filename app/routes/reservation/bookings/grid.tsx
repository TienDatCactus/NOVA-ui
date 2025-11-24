import { useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import BookingGrid from "./components/booking-grid";
import BookingGridFilters from "./fragments/booking-grid.filters";
import { useAvailableRoomsFilter } from "./container/available-booking-filter.hooks";
import { useAvailableRooms } from "./container/booking-query.hooks";
import type { Route } from "./+types/grid";

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { filters, updateFilter, resetFilters, filterAvailableRooms } =
    useAvailableRoomsFilter();

  const {
    data: rooms,
    refetch,
    isLoading,
  } = useAvailableRooms({
    checkinDate: filters.startDate ?? new Date(),
    checkoutDate: filters.endDate ?? new Date(),
    guests: filters.guests ?? 1,
    enabled: filters != null,
  });

  const filteredRooms = filterAvailableRooms(rooms ?? []);
  return (
    <div className="flex p-4  flex-col space-y-4 h-full">
      <BookingGridFilters
        filters={filters}
        updateFilters={updateFilter}
        resetFilters={resetFilters}
      />

      <div className="flex-1 overflow-auto">
        <BookingGrid
          rooms={filteredRooms}
          isLoading={isLoading}
          refetch={refetch}
        />
      </div>
    </div>
  );
}
