import { Loader2 } from "lucide-react";
import { Card } from "~/components/ui/card";
import GeneratePayrollDialog from "./components/generate-payroll-dialog";
import PayrollDetailDialog from "./components/payroll-detail-dialog";
import PayrollsList from "./components/payrolls-list";
import { usePayrollFilter } from "./container/filter.hooks";
import { usePayrolls } from "./container/query.hooks";
import PayrollsLayout from "./layouts/payrolls.layout";

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

      <Card className="p-6">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <PayrollsList data={payrolls ?? []} />
        )}
      </Card>
    </div>
  );
}
