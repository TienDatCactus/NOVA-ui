import { useMemo } from "react";
import ExpensesListView from "./components/expenses-list-view";
import useExpensesFilters from "./container/filter.hooks";
import { useExpenses } from "./container/query.hooks";
import ExpensesLayout from "./layouts/expenses.layout";
import {
  AuthLoader,
  RouteModule,
  Permission,
  UserRole,
  hasRole,
} from "~/lib/auth/auth.loader";
import { redirect } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import type { Route } from "./+types/expenses";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chi Phí - NOVA Hotel Management" },
    { name: "description", content: "Quản lý chi phí và phiếu chi" },
  ];
}

export const clientLoader = () => {
  const user = AuthLoader.getUser();

  if (hasRole(user, UserRole.HotelManager)) {
    throw redirect(DASHBOARD.expensesDashboard);
  }

  AuthLoader.guard(RouteModule.Expenses, Permission.Read);
};

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
