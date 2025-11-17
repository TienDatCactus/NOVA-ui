import type { ReactNode } from "react";
import PayrollsFilterSidebar from "../components/payrolls-filter-sidebar";
import type { PayrollFilterState } from "../container/filter.hooks";
import { Badge } from "~/components/ui/badge";

interface PayrollsViewLayoutProps {
  filterState: PayrollFilterState;
  onFilterChange: (updates: Partial<PayrollFilterState>) => void;
  totalPayrolls: number;
  paidCount: number;
  unpaidCount: number;
  children: ReactNode;
}

export default function PayrollsViewLayout({
  filterState,
  onFilterChange,
  totalPayrolls,
  paidCount,
  unpaidCount,
  children,
}: PayrollsViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <div className="w-[280px] flex-shrink-0">
        <PayrollsFilterSidebar
          filterState={filterState}
          updateFilter={onFilterChange}
        />
      </div>
      <main className="flex-1 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm">
            Tổng: {totalPayrolls}
          </Badge>
          <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200">
            Đã trả: {paidCount}
          </Badge>
          <Badge variant="outline" className="text-sm bg-orange-50 text-orange-700 border-orange-200">
            Còn nợ: {unpaidCount}
          </Badge>
        </div>
        {children}
      </main>
    </div>
  );
}
