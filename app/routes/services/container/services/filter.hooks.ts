import { useMemo, useState } from "react";
import type { ServiceListResponseDto } from "~/services/api/services/dto";
import type { ServiceFilters } from "~/services/types/service.types";

const defaultFilters: ServiceFilters = {
  typeCode: "",
  activeFilter: "",
  searchText: "",
};

export default function useServiceFilters() {
  const [filters, setFilters] = useState<ServiceFilters>(defaultFilters);
  const includeInactive = filters.activeFilter !== "active";
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

        return matchesSearch;
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
