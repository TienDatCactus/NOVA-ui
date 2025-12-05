import { useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import type { AvailableRoomsInternalResponseDto } from "~/services/api/rooms/dto";

/**
 * Interface cho available room filters
 */
export interface AvailableRoomFilters {
  CheckInDate: Date | null;
  CheckOutDate: Date | null;
  Guests: number | null;
}

const DEFAULT_FILTERS: AvailableRoomFilters = {
  CheckInDate: new Date(),
  CheckOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  Guests: null,
};

export function useAvailableRoomsFilter() {
  const [filters, setFilters] = useState<AvailableRoomFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof AvailableRoomFilters>(
    key: K,
    value: AvailableRoomFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
