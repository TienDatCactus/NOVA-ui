import { Card } from "~/components/ui/card";
import { usePayrollsContainer } from "./container/container.hooks";
import HeaderLayout from "./layouts/header.layout";
import PayrollsList from "./components/payrolls-list";
import GeneratePayrollDialog from "./components/generate-payroll-dialog";
import PayrollDetailDialog from "./components/payroll-detail-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { PayrollItem } from "~/services/api/staff/staff-payroll/dto";

export default function PayrollsPage() {
  const {
    payrolls,
    isPending,
    filterState,
    updateFilter,
    generateDialogOpen,
    setGenerateDialogOpen,
    refetch,
  } = usePayrollsContainer();

  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(
    null
  );

  const handleRowClick = (payroll: PayrollItem) => {
    setSelectedPayrollId(payroll.payrollId);
  };

  // Filter payrolls based on search query
  const filteredPayrolls = payrolls.filter((payroll: PayrollItem) => {
    if (!filterState.search) return true;
    const searchLower = filterState.search.toLowerCase();
    return (
      payroll.staffCode.toLowerCase().includes(searchLower) ||
      payroll.staffName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <HeaderLayout
        onGenerateClick={() => setGenerateDialogOpen(true)}
        filterState={filterState}
        updateFilter={updateFilter}
        onRefresh={refetch}
      />

      <Card className="p-6">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <PayrollsList
            data={filteredPayrolls}
            onSuccess={refetch}
            onRowClick={handleRowClick}
          />
        )}
      </Card>

      <GeneratePayrollDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={refetch}
      />

      {selectedPayrollId && (
        <PayrollDetailDialog
          payrollId={selectedPayrollId}
          open={!!selectedPayrollId}
          onOpenChange={(open) => !open && setSelectedPayrollId(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
