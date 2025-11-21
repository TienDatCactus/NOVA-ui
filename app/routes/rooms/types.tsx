import { useState } from "react";

import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { CreateRoomTypeDialog } from "./components/create-room-types.dialog";
import RoomTypesViewLayout from "./layouts/room-types-view.layout";
import RoomTypesDataTable from "./components/room-types-list";
import useRoomTypeFilter from "./container/room-types/filter.hooks";
import { useRoomTypes } from "./container/room-types/query.hooks";

export default function RoomTypesPage() {
  const {
    filters,
    updateFilter,
    resetFilters,
    filterRoomTypes,
    includeInactive,
  } = useRoomTypeFilter();

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
