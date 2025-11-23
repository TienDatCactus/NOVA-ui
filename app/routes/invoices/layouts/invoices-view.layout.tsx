import { ChevronRight, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
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
import { Label } from "~/components/ui/label";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDate, setExportDate] = useState<string | undefined>(undefined);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onFilterChange("page" as keyof InvoiceListParams, page as any);
  };

  const handleExport = async () => {
    try {
      const blob = await InvoicesService.exportInvoices(exportDate);
      console.log("Blob received:", blob);

      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      const filename = exportDate
        ? `invoices-report-${exportDate}.xlsx`
        : "invoices-report.xlsx";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công");
      setExportDialogOpen(false);
      setExportDate(undefined);
    } catch (e) {
      console.error(e);
      toast.error("Xuất báo cáo thất bại");
    }
  };

  const { pages } = makePageRange(currentPage, totalPages, 7);

  return (
    <div className="flex p-4 gap-6 ">
      <main className="flex-1 flex flex-col space-y-4 overflow-hidden">
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
            <div>
              <DatePicker
                mode="single"
                value={filters.IssuedFrom}
                onChange={(value) => {
                  onFilterChange("IssuedFrom", value?.toISOString());
                }}
              />
            </div>
            <ChevronRight />
            <div>
              <DatePicker
                mode="single"
                value={filters.IssuedTo}
                onChange={(value) => {
                  onFilterChange("IssuedTo", value?.toISOString());
                }}
              />
            </div>

            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="success" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Xuất báo cáo hóa đơn</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="mb-2 block">
                    Chọn ngày xuất báo cáo (tùy chọn)
                  </Label>
                  <DatePicker
                    value={exportDate}
                    onChange={(date) =>
                      setExportDate(format(date ?? "", "yyyy-MM-dd"))
                    }
                    placeholder="Chọn ngày hoặc để trống cho tất cả"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Để trống để xuất tất cả hóa đơn
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExportDialogOpen(false);
                      setExportDate(undefined);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button variant="success" onClick={handleExport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Xuất file
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <InvoicesFilterSidebar
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
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
