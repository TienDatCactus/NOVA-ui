import { useMemo, useState } from "react";
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";

export interface MenuCategoryFilters {
  includeInactive: boolean;
}

const defaultFilters: MenuCategoryFilters = {
  includeInactive: false,
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
        if (!filters.includeInactive && !category.active) {
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
    filterMenuCategories,
  };
}
