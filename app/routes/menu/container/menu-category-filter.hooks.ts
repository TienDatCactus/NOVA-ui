import { useMemo, useState } from "react";
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";

export interface MenuCategoryFilters {
  includeInactive: boolean;
  activeStatus?: "all" | "active" | "inactive";
}

const defaultFilters: MenuCategoryFilters = {
  includeInactive: true,
  activeStatus: "all",
};

export default function useMenuCategoryFilters() {
  const [filters, setFilters] = useState<MenuCategoryFilters>(defaultFilters);

  const updateFilter = <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const filterMenuCategories = useMemo(
    () => (categories: MenuCategoryItem[]) => {
      return categories.filter((category) => {
        // Filter by active status
        if (filters.activeStatus === "active" && !category.active) {
          return false;
        }
        if (filters.activeStatus === "inactive" && category.active) {
          return false;
        }
        // "all" shows everything

        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    filterMenuCategories,
  };
}
