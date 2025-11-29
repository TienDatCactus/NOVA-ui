import { useState, useMemo } from "react";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

export type ItemCategoriesFilter = {
  activeFilter: "active" | "inactive";
};

const initialFilters: ItemCategoriesFilter = {
  activeFilter: "active",
};

/**
 * Hook quản lý filters cho danh sách items
 */
export default function useItemCategoriesFilters() {
  const [filters, setFilters] = useState<ItemCategoriesFilter>(initialFilters);

  const updateFilter = <K extends keyof ItemCategoriesFilter>(
    key: K,
    value: ItemCategoriesFilter[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
