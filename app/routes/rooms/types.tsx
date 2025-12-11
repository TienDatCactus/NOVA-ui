import RoomTypesDataTable from "./components/room-types/room-types-list";
import useRoomTypeFilters from "./container/room-types/filter.hooks";
import { useRoomTypes } from "./container/room-types/query.hooks";
import RoomTypesViewLayout from "./layouts/room-types-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Loại Phòng - NOVA Hotel Management" },
    { name: "description", content: "Quản lý loại phòng khách sạn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.RoomTypes, Permission.Read);

export default function RoomTypesPage() {
  const {
    filters,
    updateFilter,
    resetFilters,
    filterRoomTypes,
    includeInactive,
  } = useRoomTypeFilters();

  const { data: roomTypes, isPending } = useRoomTypes({
    includeInactive,
  });

  const filteredRoomTypes = roomTypes ? filterRoomTypes(roomTypes) : [];

  return (
    <RoomTypesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalRoomTypes={filteredRoomTypes?.length || 0}
    >
      <RoomTypesDataTable roomTypes={filteredRoomTypes} isLoading={isPending} />
    </RoomTypesViewLayout>
  );
}
