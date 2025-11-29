import { useMemo } from "react";
import ExpensesListView from "./components/expenses-list-view";
import useExpensesFilters from "./container/filter.hooks";
import { useExpenses } from "./container/query.hooks";
import ExpensesLayout from "./layouts/expenses.layout";

export default function ExpensesRoute() {
  const { filters, updateFilter, resetFilters } = useExpensesFilters();

  const { data: expenses, isPending } = useExpenses({
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    categoryId: filters.categoryId,
  });

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  return (
    <ExpensesLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalExpenses={expenses?.length ?? 0}
      totalAmount={totalAmount}
    >
      <ExpensesListView expenses={expenses || []} isLoading={isPending} />
    </ExpensesLayout>
  );
}
