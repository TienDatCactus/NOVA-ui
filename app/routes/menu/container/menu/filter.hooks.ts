import { useMemo, useState } from "react";
import type { MenuListResponseDto } from "~/services/api/menu/dto";
import type { MenuFilters } from "~/services/types/menu.types";

const defaultFilters: MenuFilters = {
  categoryCode: "",
  activeFilter: "all",
  searchText: "",
};

export default function useMenuFilters() {
  const [filters, setFilters] = useState<MenuFilters>(defaultFilters);
  const includeInactive = filters.activeFilter !== "true";

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
        const matchesSearch =
          filters.searchText === "" ||
          item.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(filters.searchText.toLowerCase()) ||
          (item.description &&
            item.description
              .toLowerCase()
              .includes(filters.searchText.toLowerCase()));

        // Status filter
        let matchesStatus = true;
        if (filters.activeFilter === "true") {
          matchesStatus = item.active === true;
        } else if (filters.activeFilter === "false") {
          matchesStatus = item.active === false;
        }
        // "all" means no filter

        return matchesSearch && matchesStatus;
      });
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    filterMenuItems,
    includeInactive,
  };
}
