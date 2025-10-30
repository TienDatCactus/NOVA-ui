import { useMemo, useState } from "react";
import type {
  ServiceTypeItem,
  ServiceTypeListResponseDto,
} from "~/services/api/service-types/dto";

export interface ServiceTypeFilters {
  activeFilter: "" | "all" | "active";
  searchText: string;
}

const defaultFilters: ServiceTypeFilters = {
  activeFilter: "",
  searchText: "",
};

export default function useServiceTypeFilters() {
  const [filters, setFilters] = useState<ServiceTypeFilters>(defaultFilters);
  const includeInactive = filters.activeFilter !== "active";
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

        return matchesSearch;
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
