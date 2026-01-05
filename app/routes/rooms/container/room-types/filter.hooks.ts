import { useState } from "react";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
export interface RoomTypeFilters {
  searchText: string;
  activeFilter: "active" | "all";
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
  const filterRoomTypes = (roomTypes: RoomTypesListItemDto[]) => {
    if (!roomTypes) return [];

    return roomTypes.filter((roomType) => {
      const name =
        roomType.translations.find((t) => t.languageCode === "vi")?.name ||
        roomType.translations[0]?.name ||
        "";
      const matchesSearch =
        filters.searchText === "" ||
        roomType.code
          .toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        name.toLowerCase().includes(filters.searchText.toLowerCase());

      return matchesSearch;
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
