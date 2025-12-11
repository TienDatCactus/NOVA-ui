import { Loader2 } from "lucide-react";
import PayrollsList from "./components/payrolls-list";
import { usePayrollFilter } from "./container/filter.hooks";
import { usePayrolls } from "./container/query.hooks";
import PayrollsLayout from "./layouts/payrolls.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/payrolls";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bảng Lương - NOVA Hotel Management" },
    { name: "description", content: "Quản lý bảng lương nhân viên" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Payroll, Permission.Read);

export default function PayrollsPage() {
  const { filterState, updateFilter, resetFilter } = usePayrollFilter();

  const {
    data: payrolls,
    isPending,
    refetch,
  } = usePayrolls({
    year: filterState.year,
    month: filterState.month,
  });

  return (
    <div className="p-6 space-y-6">
      <PayrollsLayout
        filterState={filterState}
        updateFilter={updateFilter}
        resetFilter={resetFilter}
        onRefresh={refetch}
      />

      {isPending ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PayrollsList data={payrolls ?? []} />
      )}
    </div>
  );
}
