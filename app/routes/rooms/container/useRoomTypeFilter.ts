import { useState } from "react";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
export interface RoomTypeFilters {
  searchText: string;
  activeFilter: "all" | "active" | "inactive";
}

const DEFAULT_FILTERS: RoomTypeFilters = {
  searchText: "",
  activeFilter: "all",
};

function useRoomTypeFilter() {
  const [filters, setFilters] = useState<RoomTypeFilters>(DEFAULT_FILTERS);
  const includeInactive = filters.activeFilter !== "active";
  const updateFilter = <K extends keyof RoomTypeFilters>(
    key: K,
    value: RoomTypeFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };
  // Client-side filtering
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

      // Active filter
      const matchesActive =
        filters.activeFilter === "all" ||
        (filters.activeFilter === "active" && roomType.active) ||
        (filters.activeFilter === "inactive" && !roomType.active);

      return matchesSearch && matchesActive;
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
