import { useState } from "react";

export type StockAdjustmentFilters = {
  includeApplied: boolean;
};

const initialFilters: StockAdjustmentFilters = {
  includeApplied: false, // Default: only show unapplied
};

export default function useStockAdjustmentFilters() {
  const [filters, setFilters] =
    useState<StockAdjustmentFilters>(initialFilters);

  const updateFilter = <K extends keyof StockAdjustmentFilters>(
    key: K,
    value: StockAdjustmentFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return { filters, updateFilter, resetFilters };
}
