import { useState } from "react";
import type { ExpenseListParams } from "~/services/api/expenses/expenses.types";

const initialState: ExpenseListParams = {
  fromDate: undefined,
  toDate: undefined,
  category: "",
};

export default function useExpensesFilters() {
  const [filters, setFilters] = useState<ExpenseListParams>(initialState);

  const updateFilter = <K extends keyof ExpenseListParams>(
    key: K,
    value: ExpenseListParams[K]
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
