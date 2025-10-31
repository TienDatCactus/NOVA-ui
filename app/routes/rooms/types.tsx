import { useState } from "react";

import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import useRoomTypeFilter from "./container/room-types-filter.hooks";
import { useRoomTypes } from "./container/room-types-query.hooks";
import { CreateRoomTypeDialog } from "./components/create-room-types.dialog";
import RoomTypesViewLayout from "./layouts/room-types-view.layout";
import RoomTypesDataTable from "./components/room-types-list";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<
    RoomTypesListItemDto[]
  >([]);
  const filteredRoomTypes = roomTypes ? filterRoomTypes(roomTypes) : [];

  return (
    <RoomTypesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalRoomTypes={filteredRoomTypes?.length || 0}
      onAddRoomType={() => setCreateDialogOpen(true)}
    >
      <RoomTypesDataTable
        roomTypes={filteredRoomTypes}
        isLoading={isPending}
        onAddRoomType={() => setCreateDialogOpen(true)}
        onSelectionChange={setSelectedRoomTypes}
      />

      <CreateRoomTypeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </RoomTypesViewLayout>
  );
}
