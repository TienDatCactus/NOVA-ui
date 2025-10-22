import { useState } from "react";
import { toast } from "sonner";
import type { Route } from "./+types/rooms";
import RoomsViewLayout from "./layouts/rooms-view.layout";
import RoomsDataTable from "./components/rooms-list";
import useRooms from "./container/useRooms";
import useRoomFilters from "./container/useRoomFilter";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import BulkActionsToolbar from "./fragments/bulk-action.dialog";
// import CreateRoomDialog from "./fragments/create-room.dialog";
import RoomsHeader from "./fragments/rooms-header.layout";

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
  const { data: rooms, isPending, refetch } = useRooms();
  const { filters, updateFilter, resetFilters, filterRooms } = useRoomFilters();
  const [selectedRooms, setSelectedRooms] = useState<RoomListItemDto[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter rooms based on current filters
  const filteredRooms = rooms ? filterRooms(rooms) : [];

  const handleAddRoom = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateRoom = async (data: any) => {
    try {
      // TODO: Call API to create room
      console.log("Creating room:", data);
      toast.success("Phòng đã được thêm thành công");
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm phòng");
      console.error(error);
    }
  };

  const handleBulkDelete = async (roomIds: string[]) => {
    try {
      // TODO: Call API to delete rooms
      console.log("Deleting rooms:", roomIds);
      toast.success(`Đã xóa ${roomIds.length} phòng`);
      setSelectedRooms([]);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa phòng");
      console.error(error);
    }
  };

  const handleBulkStatusChange = async (
    roomIds: string[],
    newStatus: number
  ) => {
    try {
      // TODO: Call API to update room status
      console.log("Updating room status:", { roomIds, newStatus });
      toast.success(`Đã cập nhật trạng thái cho ${roomIds.length} phòng`);
      setSelectedRooms([]);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      console.error(error);
    }
  };

  const handleClearSelection = () => {
    setSelectedRooms([]);
  };

  return (
    <RoomsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
    >
      <RoomsHeader
        totalRooms={filteredRooms.length}
        onAddRoom={handleAddRoom}
      />

      <BulkActionsToolbar
        selectedRooms={selectedRooms}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
      />

      <RoomsDataTable
        rooms={filteredRooms}
        isLoading={isPending}
        onAddRoom={handleAddRoom}
        onSelectionChange={setSelectedRooms}
      />

      {/* <CreateRoomDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateRoom}
      /> */}
    </RoomsViewLayout>
  );
}
