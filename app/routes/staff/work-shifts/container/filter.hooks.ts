import { useMemo, useState } from "react";

export interface WorkShiftFilters {
  searchQuery: string;
  activeFilter: "all" | "active";
}

const defaultFilters: WorkShiftFilters = {
  searchQuery: "",
  activeFilter: "all",
};

export function useWorkShiftFilter() {
  const [filters, setFilters] = useState<WorkShiftFilters>(defaultFilters);

  const updateFilter = <K extends keyof WorkShiftFilters>(
    key: K,
    value: WorkShiftFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return useMemo(
    () => ({
      filters,
      updateFilter,
      resetFilters,
    }),
    [filters]
  );
}
