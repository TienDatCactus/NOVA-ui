import { useState, useMemo } from "react";

export interface UnitFilters {
  searchQuery: string;
  activeFilter: string; // "all" | "true" | "false"
}

const defaultFilters: UnitFilters = {
  searchQuery: "",
  activeFilter: "all",
};

function useUnitFilters() {
  const [filters, setFilters] = useState<UnitFilters>(defaultFilters);

  const updateFilter = <K extends keyof UnitFilters>(
    key: K,
    value: UnitFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}

export default useUnitFilters;
