import { useMemo, useState } from "react";
import type { MenuListResponseDto } from "~/services/api/menu/dto";
import type { MenuFilters } from "~/services/types/menu.types";

const defaultFilters: MenuFilters = {
  categoryId: "",
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

  const filterMenuItems = useMemo(
    () => (menuItems: MenuListResponseDto) => {
      return menuItems.filter((item) => {
        // Filter by search text
        const matchesSearch =
          filters.searchText === "" ||
          item.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          (item.description &&
            item.description
              .toLowerCase()
              .includes(filters.searchText.toLowerCase()));

        // Filter by active status
        const matchesActive =
          filters.activeFilter === "" ||
          filters.activeFilter === "all" ||
          (filters.activeFilter === "active" && item.active);

        return matchesSearch && matchesActive;
      });
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    filterMenuItems,
  };
}
