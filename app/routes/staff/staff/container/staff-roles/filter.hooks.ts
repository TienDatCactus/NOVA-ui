import { useState, useCallback } from "react";

export interface StaffRoleFilters {
  search: string;
}

const defaultFilters: StaffRoleFilters = {
  search: "",
};

export function useStaffRoleFilters() {
  const [filters, setFilters] = useState<StaffRoleFilters>(defaultFilters);

  const handleFilterChange = useCallback(
    <K extends keyof StaffRoleFilters>(key: K, value: StaffRoleFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    handleFilterChange,
    handleResetFilters,
  };
}
