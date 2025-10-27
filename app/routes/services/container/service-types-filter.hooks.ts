import { useMemo, useState } from "react";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";

export interface ServiceTypeFilters {
  includeInactive: boolean;
}

const defaultFilters: ServiceTypeFilters = {
  includeInactive: false,
};

export default function useServiceTypeFilters() {
  const [filters, setFilters] = useState<ServiceTypeFilters>(defaultFilters);

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
    () => (types: ServiceTypeItem[]) => {
      return types.filter((type) => {
        // Filter by active status
        if (!filters.includeInactive && !type.active) {
          return false;
        }

        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    filterServiceTypes,
  };
}
