import type { Route } from "./+types/rooms";
import RoomsDataTable from "./components/rooms/rooms-list";
import useRoomFilters from "./container/rooms/filter.hooks";
import { useRooms } from "./container/rooms/query.hooks";
import RoomsViewLayout from "./layouts/rooms-view.layout";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { filters, updateFilter, resetFilters, filterRooms } = useRoomFilters();
  const { data: rooms, isPending } = useRooms({
    date: filters.date,
    status: filters.status,
    typeId: filters.typeId,
  });
  const filteredRooms = rooms ? filterRooms(rooms) : [];

  return (
    <RoomsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalRooms={filteredRooms.length}
    >
      <RoomsDataTable rooms={filteredRooms} isLoading={isPending} />
    </RoomsViewLayout>
  );
}
