import type { ReactNode } from "react";
import InvoicesFilterSidebar from "../fragments/invoices/filter.sidebar";
import type { InvoiceFilters } from "../container/invoices/filter.hooks";
import { Button } from "~/components/ui/button";
import { FileText } from "lucide-react";

interface InvoicesViewLayoutProps {
  children: ReactNode;
  filters: InvoiceFilters;
  onFilterChange: <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalInvoices: number;
  totalPages?: number;
  currentPage?: number;
}

function InvoicesViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalInvoices,
  totalPages,
  currentPage,
}: InvoicesViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <InvoicesFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý hóa đơn</h1>
            <p className="text-muted-foreground mt-1">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalInvoices}
              </span>{" "}
              hóa đơn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default InvoicesViewLayout;
