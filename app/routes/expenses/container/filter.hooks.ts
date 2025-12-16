import { useState } from "react";

export type ExpensesFilter = {
  fromDate?: string;
  toDate?: string;
  categoryId?: string;
};

const initialState: ExpensesFilter = {
  fromDate: undefined,
  toDate: undefined,
  categoryId: "",
};

export default function useExpensesFilters() {
  const [filters, setFilters] = useState<ExpensesFilter>(initialState);

  const updateFilter = <K extends keyof ExpensesFilter>(
    key: K,
    value: ExpensesFilter[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialState);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
