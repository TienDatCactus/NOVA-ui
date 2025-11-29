import { useState } from "react";

export interface StaffShiftFilters {
  selectedStaffId: string;
  fromDate?: string;
  toDate?: string;
  attendanceStatus?: "present" | "absent" | "assigned";
}

export function useScheduleFilter() {
  const [filters, setFilters] = useState<StaffShiftFilters>({
    selectedStaffId: "",
    fromDate: undefined,
    toDate: undefined,
    attendanceStatus: undefined,
  });

  const updateFilters = <K extends keyof StaffShiftFilters>(
    key: K,
    value: StaffShiftFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      selectedStaffId: "",
      fromDate: undefined,
      toDate: undefined,
    });
  };

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}
