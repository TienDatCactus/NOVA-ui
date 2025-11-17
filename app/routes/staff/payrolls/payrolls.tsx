import { Card } from "~/components/ui/card";
import { usePayrollsContainer } from "./container/container.hooks";
import HeaderLayout from "./fragments/header.layout";
import PayrollsList from "./components/payrolls-list";
import GeneratePayrollDialog from "./components/generate-payroll-dialog";
import PayrollDetailDialog from "./components/payroll-detail-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { PayrollItem } from "~/services/api/staff-payroll/dto";

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

  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);

  const handleRowClick = (payroll: PayrollItem) => {
    setSelectedPayrollId(payroll.payrollId);
  };

  return (
    <div className="p-6 space-y-6">
      <HeaderLayout
        onGenerateClick={() => setGenerateDialogOpen(true)}
        filterState={filterState}
        updateFilter={updateFilter}
      />

      <Card className="p-6">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <PayrollsList 
            data={payrolls} 
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
