import { useState } from "react";
import { toast } from "sonner";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { useRooms } from "./query.hooks";
import useRoomFilters from "./filter.hooks";
import { useDeleteRoom } from "./mutation.hooks";

function useRoomsContainer() {
  const [selectedRooms, setSelectedRooms] = useState<RoomListItemDto[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteRoom();

  const filteredRooms = rooms ? filterRooms(rooms) : [];

  const handleBulkDelete = async (roomIds: string[]) => {
    try {
      const deletePromises = roomIds.map((roomId) => {
        return new Promise((resolve, reject) => {
          deleteRoom(roomId, {
            onSuccess: () => resolve(roomId),
            onError: (error) => reject(error),
          });
        });
      });

      await Promise.all(deletePromises);
      toast.success(`Đã xóa ${roomIds.length} phòng`);
      setSelectedRooms([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkStatusChange = async (
    roomIds: string[],
    newStatus: number
  ) => {
    try {
      setSelectedRooms([]);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearSelection = () => {
    setSelectedRooms([]);
  };

  return {
    filteredRooms,
    isPending: isPending || isDeleting,
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
    isDeleting,
  };
}
export default useRoomsContainer;
