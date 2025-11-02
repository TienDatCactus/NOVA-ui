import { useMemo, useState } from "react";
import type { AvailableRoomsInternalResponseDto } from "~/services/api/rooms/dto";

/**
 * Interface cho menu category filters
 */
export interface AvailableBookingFilters {
  searchText: string;
  startDate: Date | null;
  endDate: Date | null;
  guests: number | null;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: AvailableBookingFilters = {
  searchText: "",
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  guests: null,
};

export function useAvailableRoomsFilter() {
  const [filters, setFilters] =
    useState<AvailableBookingFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof AvailableBookingFilters>(
    key: K,
    value: AvailableBookingFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterAvailableRooms = useMemo(() => {
    return (rooms: AvailableRoomsInternalResponseDto) => {
      const text = filters.searchText.trim().toLowerCase();
      return rooms.filter((rt) => {
        const matchesSearch =
          !text ||
          rt.roomTypeName.toLowerCase().includes(text) ||
          rt.roomTypeCode.toLowerCase().includes(text) ||
          rt.availableRooms.some((r) =>
            r.roomName.toLowerCase().includes(text)
          );

        const matchesGuests =
          filters.guests == null || rt.maxOccupancy >= filters.guests;

        // No per-date availability in DTO; require at least one available room
        const hasAvailability = rt.availableCount > 0;

        return matchesSearch && matchesGuests && hasAvailability;
      });
    };
  }, [filters]);
  return {
    filters,
    updateFilter,
    resetFilters,
    filterAvailableRooms,
  };
}
