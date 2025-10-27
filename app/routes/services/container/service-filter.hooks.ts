import { useMemo, useState } from "react";
import type { ServiceFilters } from "~/services/types/service.types";
import type { ServiceItem } from "~/services/api/services/dto";

const defaultFilters: ServiceFilters = {
  typeCode: "all",
  includeInactive: false,
};

export default function useServiceFilters() {
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);

  const updateFilter = <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filterServices = useMemo(
    () => (services: ServiceItem[]) => {
      return services.filter((service) => {
        // Filter by active status
        if (!filters.includeInactive && !service.active) {
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
    filterServices,
  };
}
