import { useState, useMemo } from "react";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

export type ItemsFilter = {
  activeFilter: "active" | "inactive";
  lowStock: boolean;
  categoryId?: string;
};

const initialFilters: ItemsFilter = {
  activeFilter: "active",
  lowStock: false,
  categoryId: undefined,
};

/**
 * Hook quản lý filters cho danh sách items
 */
export default function useItemsFilters() {
  const [filters, setFilters] = useState<ItemsFilter>(initialFilters);

  const updateFilter = <K extends keyof ItemsFilter>(
    key: K,
    value: ItemsFilter[K]
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
