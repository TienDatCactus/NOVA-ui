import { useState } from "react";

export interface HolidayFilterState {
  search: string;
}

export function useHolidayFilter() {
  const [filterState, setFilterState] = useState<HolidayFilterState>({
    search: "",
  });

  const updateFilter = (updates: Partial<HolidayFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilterState({ search: "" });
  };

  return {
    filterState,
    updateFilter,
    resetFilter,
  };
}
