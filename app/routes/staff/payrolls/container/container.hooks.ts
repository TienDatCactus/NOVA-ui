import { useState } from "react";
import { usePayrollFilter } from "./filter.hooks";
import { usePayrollsQuery } from "./query.hooks";

export function usePayrollsContainer() {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const { filterState, updateFilter, resetFilter } = usePayrollFilter();

  const { data, isPending, isError, error, refetch } = usePayrollsQuery({
    year: filterState.year,
    month: filterState.month,
  });

  const payrolls = (data as any) || [];

  return {
    // Data
    payrolls,
    isPending,
    isError,
    error,

    // Filter
    filterState,
    updateFilter,
    resetFilter,

    // Dialogs
    generateDialogOpen,
    setGenerateDialogOpen,

    // Actions
    refetch,
  };
}
