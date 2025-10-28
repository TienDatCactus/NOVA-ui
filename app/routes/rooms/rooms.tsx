import type { Route } from "./+types/rooms";
import CreateRoomDialog from "./components/create-room.dialog";
import RoomsDataTable from "./components/rooms-list";
import { useRoomTypes } from "./container/useRoomTypesQuery";
import useRoomsContainer from "./container/useRoomsContainer";
import BulkActionsToolbar from "./fragments/room-types/rooms-bulk-action.dialog";
import RoomsViewLayout from "./layouts/rooms-view.layout";

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
  const { data: roomTypes } = useRoomTypes();
  const {
    filteredRooms,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    setCreateDialogOpen,
    handleBulkDelete,
    handleBulkStatusChange,
    handleClearSelection,
    selectedRooms,
    setSelectedRooms,
    createDialogOpen,
  } = useRoomsContainer();
  return (
    <RoomsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalRooms={filteredRooms.length}
      onAddRoom={() => setCreateDialogOpen(true)}
    >
      <BulkActionsToolbar
        selectedRooms={selectedRooms}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
      />

      <RoomsDataTable
        rooms={filteredRooms}
        isLoading={isPending}
        onAddRoom={() => setCreateDialogOpen(true)}
        onSelectionChange={setSelectedRooms}
      />

      <CreateRoomDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        roomTypes={roomTypes}
      />
    </RoomsViewLayout>
  );
}
