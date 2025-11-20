import { useState, useMemo } from "react";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

export type ItemsFilterState = {
  activeFilter: "all" | "active" | "inactive";
  lowStockOnly: boolean;
};

const initialFilters: ItemsFilterState = {
  activeFilter: "active",
  lowStockOnly: false,
};

/**
 * Hook quản lý filters cho danh sách items
 */
export default function useItemsFilters() {
  const [filters, setFilters] = useState<ItemsFilterState>(initialFilters);

  const updateFilter = <K extends keyof ItemsFilterState>(
    key: K,
    value: ItemsFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const filterItems = (items: StockItemsListItemDto[]) => {
    return items.filter((item) => {
      // Filter by active status
      if (filters.activeFilter === "active" && !item.isActive) return false;
      if (filters.activeFilter === "inactive" && item.isActive) return false;

      // Filter by low stock
      if (
        filters.lowStockOnly &&
        (item.currentStock ?? 0) >= (item.minStock ?? 0)
      ) {
        return false;
      }

      return true;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterItems,
  };
}

/**
 * Hook tính toán stats từ danh sách items
 */
export function useItemsStats(items: StockItemsListItemDto[]) {
  return useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter((item) => item.isActive).length;
    const lowStockItems = items.filter(
      (item) => (item.currentStock ?? 0) < (item.minStock ?? 0)
    ).length;

    // Tổng giá trị kho (currentStock × averageCost)
    const totalInventoryValue = items.reduce(
      (sum, item) => sum + (item.currentStock ?? 0) * (item.averageCost ?? 0),
      0
    );

    return {
      totalItems,
      activeItems,
      lowStockItems,
      totalInventoryValue,
    };
  }, [items]);
}
