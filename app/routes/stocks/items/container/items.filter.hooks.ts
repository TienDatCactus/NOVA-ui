import { useState, useMemo } from "react";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";

export type ItemsFilterState = {
  searchQuery: string;
  categoryId: string | null;
  activeFilter: "all" | "active" | "inactive";
  lowStockOnly: boolean;
};

const initialFilters: ItemsFilterState = {
  searchQuery: "",
  categoryId: null,
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

  /**
   * Lọc items dựa trên filters (client-side filtering)
   */
  const filterItems = (items: StockItemsListItemDto[]) => {
    return items.filter((item) => {
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchDescription = item.description.toLowerCase().includes(query);
        if (!matchName && !matchCode && !matchDescription) return false;
      }

      // Filter by category
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }

      // Filter by active status
      if (filters.activeFilter === "active" && !item.isActive) return false;
      if (filters.activeFilter === "inactive" && item.isActive) return false;

      // Filter by low stock
      if (filters.lowStockOnly && item.currentStock >= item.minStock) {
        return false;
      }

      return true;
    });
  };

  /**
   * Sắp xếp items
   */
  const sortItems = (
    items: StockItemsListItemDto[],
    sortBy: "name" | "stock" | "code" = "name"
  ) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "code":
          return a.code.localeCompare(b.code);
        case "stock":
          return a.currentStock - b.currentStock;
        default:
          return 0;
      }
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterItems,
    sortItems,
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
      (item) => item.currentStock < item.minStock
    ).length;

    // Tổng giá trị kho (currentStock × averageCost)
    const totalInventoryValue = items.reduce(
      (sum, item) => sum + item.currentStock * item.averageCost,
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
