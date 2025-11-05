import { useState } from "react";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";

export interface RoomTypeFilters {
  searchText: string;
  activeFilter: "all" | "true" | "false";
}

const DEFAULT_FILTERS: RoomTypeFilters = {
  searchText: "",
  activeFilter: "all",
};

function useRoomTypeFilter() {
  const [filters, setFilters] = useState<RoomTypeFilters>(DEFAULT_FILTERS);
  const includeInactive = filters.activeFilter !== "true";

  const updateFilter = <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterRoomTypes = (roomTypes: RoomTypesListItemDto[]) => {
    if (!roomTypes) return [];

    return roomTypes.filter((roomType) => {
      // Search filter
      const matchesSearch =
        filters.searchText === "" ||
        roomType.code
          .toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        roomType.name.toLowerCase().includes(filters.searchText.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (filters.activeFilter === "true") {
        matchesStatus = roomType.active === true;
      } else if (filters.activeFilter === "false") {
        matchesStatus = roomType.active === false;
      }
      // "all" means no filter

      return matchesSearch && matchesStatus;
    });
  };

  return {
    filterRoomTypes,
    filters,
    updateFilter,
    resetFilters,
    includeInactive,
  };
}

export default useRoomTypeFilter;
