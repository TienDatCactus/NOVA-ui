import { useState, useEffect } from "react";

export interface AttendanceFilterState {
  selectedStaffIds: string[];
  selectedStatus: string[];
}

export function useAttendanceFilter() {
  const [filterState, setFilterState] = useState<AttendanceFilterState>({
    selectedStaffIds: [],
    selectedStatus: [],
  });

  const setStaffFilter = (staffIds: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedStaffIds: staffIds }));
  };

  const setStatusFilter = (status: string[]) => {
    setFilterState((prev) => ({ ...prev, selectedStatus: status }));
  };

  const clearAllFilters = () => {
    setFilterState({
      selectedStaffIds: [],
      selectedStatus: [],
    });
  };

  return {
    filterState,
    setStaffFilter,
    setStatusFilter,
    clearAllFilters,
  };
}
