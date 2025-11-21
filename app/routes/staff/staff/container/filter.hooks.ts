import { useState, useMemo } from "react";

export interface StaffFilters {
  code: "";
  fullName: "";
}

const DEFAULT_FILTERS: StaffFilters = {
  code: "",
  fullName: "",
};

export function useStaffFilters() {
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
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
