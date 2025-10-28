import { useState } from "react";
import type { RoomListItemDto } from "~/services/api/rooms/dto";

export interface RoomFilters {
  searchText: string;
  status: string[];
  roomTypes: string[];
  isOccupied?: boolean | null;
  locked?: boolean | null;
  priceRange: [number, number];
}

const DEFAULT_FILTERS: RoomFilters = {
  searchText: "",
  status: [],
  roomTypes: [],
  isOccupied: null,
  priceRange: [0, 5000000],
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
      console.log(filters.status);
      console.log(room.status);
      if (filters.status.length > 0 && !filters.status.includes(room.status)) {
        return false;
      }

      if (
        filters.roomTypes.length > 0 &&
        !filters.roomTypes.includes(room.roomTypeName)
      ) {
        return false;
      }

      // Occupied filter
      if (
        filters.isOccupied !== null &&
        room.isOccupied !== filters.isOccupied
      ) {
        return false;
      }

      // Price range filter
      if (
        room.dailyPrice < filters.priceRange[0] ||
        room.dailyPrice > filters.priceRange[1]
      ) {
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
