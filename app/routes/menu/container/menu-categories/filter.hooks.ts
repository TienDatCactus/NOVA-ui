import { useMemo, useState } from "react";
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";

/**
 * Interface cho menu category filters
 */
export interface MenuCategoryFilters {
  searchText: string;
  activeFilter: "all" | "true" | "false";
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: MenuCategoryFilters = {
  searchText: "",
  activeFilter: "all",
};

/**
 * Hook để quản lý filters cho menu categories với logic filter tích hợp
 */
export function useMenuCategoryFilters() {
  const [filters, setFilters] = useState<MenuCategoryFilters>(DEFAULT_FILTERS);
  const includeInactive = filters.activeFilter !== "true";

  const updateFilter = <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  /**
   * Filter categories dựa trên filters hiện tại
   */
  const filterCategories = useMemo(() => {
    return (categories: MenuCategoryItemDto[]) => {
      return categories.filter((category) => {
        // Filter by search text (name, code)
        const matchesSearch =
          !filters.searchText ||
          category.name
            .toLowerCase()
            .includes(filters.searchText.toLowerCase()) ||
          category.code
            .toLowerCase()
            .includes(filters.searchText.toLowerCase());

        // Status filter
        let matchesStatus = true;
        if (filters.activeFilter === "true") {
          matchesStatus = category.active === true;
        } else if (filters.activeFilter === "false") {
          matchesStatus = category.active === false;
        }
        // "all" means no filter

        return matchesSearch && matchesStatus;
      });
    };
  }, [filters.searchText, filters.activeFilter]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filterCategories,
    includeInactive,
  };
}
