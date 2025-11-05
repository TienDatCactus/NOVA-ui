import { useMemo, useState } from "react";
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";

export interface ServiceTypeFilters {
  activeFilter: "all" | "true" | "false";
  searchText: string;
}

const defaultFilters: ServiceTypeFilters = {
  activeFilter: "all",
  searchText: "",
};

export default function useServiceTypeFilters() {
  const [filters, setFilters] = useState<ServiceTypeFilters>(defaultFilters);
  const includeInactive = filters.activeFilter !== "true";

  const updateFilter = <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filterServiceTypes = useMemo(
    () => (types: ServiceTypeListResponseDto) => {
      return types.filter((type) => {
        const matchesSearch =
          filters.searchText === "" ||
          type.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          type.code.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          (type.description &&
            type.description
              .toLowerCase()
              .includes(filters.searchText.toLowerCase()));

        // Status filter
        let matchesStatus = true;
        if (filters.activeFilter === "true") {
          matchesStatus = type.active === true;
        } else if (filters.activeFilter === "false") {
          matchesStatus = type.active === false;
        }
        // "all" means no filtering

        return matchesSearch && matchesStatus;
      });
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    filterServiceTypes,
    includeInactive,
  };
}
