import { useState } from "react";
import type { StaffListParams } from "~/services/api/staff/staff/staff.types";

const DEFAULT_FILTERS: StaffListParams = {
  role: "",
  gender: "",
};

export function useStaffFilters() {
  const [filters, setFilters] = useState<StaffListParams>(DEFAULT_FILTERS);
  const updateFilter = <K extends keyof StaffListParams>(
    key: K,
    value: StaffListParams[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilter = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateFilter,
    resetFilter,
  };
}
