import { useState } from "react";

export interface PayrollFilterState {
  year?: number;
  month?: number;
  search?: string;
}

export function usePayrollFilter() {
  const currentDate = new Date();
  const [filterState, setFilterState] = useState<PayrollFilterState>({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    search: "",
  });

  const updateFilter = (updates: Partial<PayrollFilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilter = () => {
    setFilterState({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      search: "",
    });
  };

  return {
    filterState,
    updateFilter,
    resetFilter,
  };
}
