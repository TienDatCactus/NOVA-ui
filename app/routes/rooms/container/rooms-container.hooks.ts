import { useState } from "react";
import { toast } from "sonner";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import useRoomFilters from "./rooms-filter.hooks";
import { useRooms } from "./rooms-query.hooks";

function useRoomsContainer() {
  const { filters, updateFilter, resetFilters, filterRooms } = useRoomFilters();
  const {
    data: rooms,
    isPending,
    refetch,
  } = useRooms({
    date: filters.date,
    status: filters.status,
    typeId: filters.typeId,
  });
  const [selectedRooms, setSelectedRooms] = useState<RoomListItemDto[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredRooms = rooms ? filterRooms(rooms) : [];

  const handleBulkDelete = async (roomIds: string[]) => {
    try {
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

  return {
    filteredRooms,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    selectedRooms,
    setCreateDialogOpen,
    handleBulkDelete,
    handleBulkStatusChange,
    handleClearSelection,
    setSelectedRooms,
    createDialogOpen,
  };
}
export default useRoomsContainer;
