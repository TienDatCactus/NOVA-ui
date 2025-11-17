import { useState } from "react";

export interface PayrollFilterState {
  year?: number;
  month?: number;
}

export function usePayrollFilter() {
  const currentDate = new Date();
  const [filterState, setFilterState] = useState<PayrollFilterState>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  const updateFilter = (updates: Partial<PayrollFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilterState({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
    });
  };

  return {
    filterState,
    updateFilter,
    resetFilter,
  };
}
