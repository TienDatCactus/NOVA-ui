import { useMemo, useState } from "react";
import type { ServiceFilters } from "~/services/types/service.types";
import type {
  ServiceItem,
  ServiceListResponseDto,
} from "~/services/api/services/dto";

const defaultFilters: ServiceFilters = {
  typeCode: "",
  includeInactive: false,
  searchText: "",
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
    () => (services: ServiceListResponseDto) => {
      return services.filter((service) => {
        const matchesSearch =
          filters.searchText === "" ||
          service.typeName
            .toLowerCase()
            .includes(filters.searchText.toLowerCase());

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
  };
}
