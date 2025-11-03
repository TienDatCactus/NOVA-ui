import { useState, useMemo } from "react";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";

interface UnitFilters {
  searchQuery: string;
  isActive: string; // "all" | "true" | "false"
}

function useUnitFilters() {
  const [filters, setFilters] = useState<UnitFilters>({
    searchQuery: "",
    isActive: "all",
  });

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      isActive: "all",
    });
  };

  const filterUnits = useMemo(() => {
    return (units: UnitItemDetailResponseDto[]) => {
      let filtered = [...units];

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (unit) =>
            unit.code.toLowerCase().includes(query) ||
            unit.name.toLowerCase().includes(query)
        );
      }

      // Active status filter
      if (filters.isActive !== "all") {
        const isActive = filters.isActive === "true";
        filtered = filtered.filter((unit) => unit.active === isActive);
      }

      return filtered;
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filterUnits,
  };
}

export default useUnitFilters;
