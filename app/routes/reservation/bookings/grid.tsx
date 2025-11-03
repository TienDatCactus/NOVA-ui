import { useNavigate } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/grid";
import BookingGrid from "./components/booking-grid";
import BookingGridFilters from "./fragments/booking-grid-filters";
import { useAvailableRoomsFilter } from "./container/available-booking-filter.hooks";
import { useAvailableRooms } from "./container/booking-query.hooks";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
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
  const handleBookNow = (roomId: string) => {
    navigate(`/dashboard/reservation/new-booking?roomId=${roomId}`);
  };
  const handleViewDetails = (roomId: string) => {
    navigate(`/dashboard/rooms/${roomId}`);
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
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
          onBookNow={handleBookNow}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
