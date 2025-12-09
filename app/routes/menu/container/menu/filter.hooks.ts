import { useState } from "react";
import type { MenuFilters } from "~/services/api/menu/menu.types";

const defaultFilters: MenuFilters = {
  categoryCode: "",
  activeFilter: "",
  searchText: "",
};

export default function useMenuFilters() {
  const [filters, setFilters] = useState<MenuFilters>(defaultFilters);

  const updateFilter = <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
