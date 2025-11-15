import { useState, useMemo } from "react";

export interface StaffFilters {
  searchText: string;
  includeInactive: boolean;
}

const DEFAULT_FILTERS: StaffFilters = {
  searchText: "",
  includeInactive: false,
};

export function useStaffFilters() {
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_FILTERS);

  const handleFilterChange = <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Convert filters to API params
  const apiParams = useMemo(() => {
    return {
      includeInactive: filters.includeInactive,
    };
  }, [filters.includeInactive]);

  // Client-side filtering for search text
  const clientFilters = useMemo(() => {
    return {
      searchText: filters.searchText.toLowerCase().trim(),
    };
  }, [filters.searchText]);

  return {
    filters,
    apiParams,
    clientFilters,
    handleFilterChange,
    handleResetFilters,
  };
}
