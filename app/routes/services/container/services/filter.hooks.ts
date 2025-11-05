import { useMemo, useState } from "react";
import type { ServiceListResponseDto } from "~/services/api/services/dto";
import type { ServiceFilters } from "~/services/types/service.types";

const defaultFilters: ServiceFilters = {
  typeCode: "",
  activeFilter: "all",
  searchText: "",
};

export default function useServiceFilters() {
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);
  const includeInactive = filters.activeFilter !== "true";

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
    () => (services: ServiceListResponseDto) => {
      return services.filter((service) => {
        const matchesSearch =
          filters.searchText === "" ||
          service.name
            .toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          service.code
            .toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          (service.description &&
            service.description
              .toLowerCase()
              .includes(filters.searchText.toLowerCase()));

        // Status filter
        let matchesStatus = true;
        if (filters.activeFilter === "true") {
          matchesStatus = service.active === true;
        } else if (filters.activeFilter === "false") {
          matchesStatus = service.active === false;
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
    filterServices,
    includeInactive,
  };
}
