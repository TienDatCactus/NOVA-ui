import type { Route } from "./+types/rooms";
import RoomsDataTable from "./components/rooms/rooms-list";
import useRoomFilters from "./container/rooms/filter.hooks";
import { useRooms } from "./container/rooms/query.hooks";
import RoomsViewLayout from "./layouts/rooms-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phòng - NOVA Hotel Management" },
    { name: "description", content: "Quản lý phòng khách sạn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Rooms, Permission.Read);

export default function Component({}: Route.ComponentProps) {
  const { filters, updateFilter, resetFilters, filterRooms } = useRoomFilters();
  const { data: rooms, isPending } = useRooms({
    date: filters.date,
    status: filters.status || undefined,
    typeId: filters.typeId || undefined,
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
