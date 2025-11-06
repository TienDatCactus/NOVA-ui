import { useState, useMemo } from "react";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";

interface UnitFilters {
  searchQuery: string;
  isActive: string; // "all" | "true" | "false"
}

const defaultFilters: UnitFilters = {
  searchQuery: "",
  isActive: "all",
};

function useUnitFilters() {
  const [filters, setFilters] = useState<UnitFilters>(defaultFilters);

  // Derived value for API params
  const includeInactive = filters.isActive !== "true";

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filterUnits = useMemo(() => {
    return (units: UnitItemDetailResponseDto[]) => {
      let filtered = [...units];

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (unit) =>
            unit.code.toLowerCase().includes(query) ||
            unit.name.toLowerCase().includes(query)
        );
      }

      if (filters.isActive === "true") {
        filtered = filtered.filter((unit) => unit.active === true);
      } else if (filters.isActive === "false") {
        filtered = filtered.filter((unit) => unit.active === false);
      }

      return filtered;
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filterUnits,
    includeInactive,
  };
}

export default useUnitFilters;
