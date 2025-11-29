import { useMemo } from "react";
import { useExpenseSummary } from "../../container/query.hooks";
import type { ExpenseListParams } from "~/services/api/expenses/expenses.types";

export function useDashboardData(params?: ExpenseListParams) {
  const { data: summary, isPending, error } = useExpenseSummary(params);

  // Transform and memoize data for components
  const dashboardData = useMemo(() => {
    if (!summary) {
      return {
        totalAmount: 0,
        byCategory: {},
        byMonth: {},
        isEmpty: true,
      };
    }

    return {
      totalAmount: summary.totalAmount,
      byCategory: summary.byCategory,
      byMonth: summary.byMonth,
      isEmpty: summary.totalAmount === 0,
    };
  }, [summary]);

  return {
    ...dashboardData,
    isPending,
    error,
  };
}
