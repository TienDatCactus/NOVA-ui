import { useState } from "react";

export interface ScheduleFilterState {
  searchText: string;
  selectedStaffId: string;
  selectedShiftIds: string[]; // Changed to array for multiple selection
}

export function useScheduleFilter() {
  const [filterState, setFilterState] = useState<ScheduleFilterState>({
    searchText: "",
    selectedStaffId: "",
    selectedShiftIds: [],
  });

  const updateFilter = (updates: Partial<ScheduleFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilterState({
      searchText: "",
      selectedStaffId: "",
      selectedShiftIds: [],
    });
  };

  return {
    filterState,
    updateFilter,
    resetFilter,
  };
}
