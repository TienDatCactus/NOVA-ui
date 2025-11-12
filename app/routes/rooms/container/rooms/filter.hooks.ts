import { useState } from "react";
import type { RoomListItemDto } from "~/services/api/rooms/dto";

export interface RoomFilters {
  searchText: string;
  status?:
    | "Available"
    | "Occupied"
    | "Dirty"
    | "OutOfService"
    | "Reserved"
    | "Cleaning"
    | "Locked"
    | undefined;
  date?: string;
  typeId?: string;
  isOccupied?: boolean | null;
  locked?: boolean | null;
}

const DEFAULT_FILTERS: RoomFilters = {
  searchText: "",
  date: undefined,
  status: undefined,
  typeId: undefined,
  isOccupied: null,
};

function useRoomFilters() {
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof RoomFilters>(
    key: K,
    value: RoomFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterRooms = (rooms: RoomListItemDto[]) => {
    return rooms.filter((room) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          room.roomName.toLowerCase().includes(searchLower) ||
          room.roomTypeCode.toLowerCase().includes(searchLower) ||
          room.roomTypeName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.status && room.status !== filters.status) {
        return false;
      }

      return true;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterRooms,
  };
}

export default useRoomFilters;
