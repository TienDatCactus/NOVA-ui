import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";
import { InvoicesService } from "~/services/api/invoices";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";
import InvoicesFilterSidebar from "../fragments/invoices/filter.sidebar";

interface InvoicesViewLayoutProps {
  children: ReactNode;
  filters: InvoiceListParams;
  onFilterChange: <K extends keyof InvoiceListParams>(
    key: K,
    value: InvoiceListParams[K]
  ) => void;
  onResetFilters: () => void;
  totalInvoices: number;
  totalPages?: number;
  currentPage?: number;
}

function makePageRange(current: number, total: number, maxPages = 5) {
  const half = Math.floor(maxPages / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + maxPages - 1);
  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1);
  }
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return { pages, start, end };
}

function InvoicesViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalInvoices,
  totalPages = 1,
  currentPage = 1,
}: InvoicesViewLayoutProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onFilterChange("page" as keyof InvoiceListParams, page as any);
  };
  const handleExport = async () => {
    // Export all invoices filtered by starting date (IssuedFrom) if provided, else today
    const date = filters.IssuedFrom || filters.IssuedTo || undefined;
    try {
      const blob = await InvoicesService.exportInvoices(date);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-report${date ? `-${date}` : ""}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const { pages } = makePageRange(currentPage, totalPages, 7);

  return (
    <div className="flex p-4 gap-6 ">
      <div className="w-72 flex-shrink-0">
        <InvoicesFilterSidebar
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
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
            <Button variant="success" className="gap-2" onClick={handleExport}>
              <FileText className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                to="#"
                onClick={(e: any) => {
                  e?.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage <= 1}
              />
            </PaginationItem>

            {/* If first page not in range show first + ellipsis */}
            {pages[0] > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    to="#"
                    onClick={(e: any) => {
                      e?.preventDefault();
                      handlePageChange(1);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-md",
                      currentPage === 1 && "bg-primary text-primary-foreground"
                    )}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {pages[0] > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  to="#"
                  onClick={(e: any) => {
                    e?.preventDefault();
                    handlePageChange(p);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-md",
                    p === currentPage && "bg-primary text-primary-foreground"
                  )}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* If last page not in range show ellipsis + last */}
            {pages[pages.length - 1] < totalPages && (
              <>
                {pages[pages.length - 1] < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    to="#"
                    onClick={(e: any) => {
                      e?.preventDefault();
                      handlePageChange(totalPages);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-md",
                      totalPages === currentPage &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                to="#"
                onClick={(e: any) => {
                  e?.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </main>
    </div>
  );
}

export default InvoicesViewLayout;
