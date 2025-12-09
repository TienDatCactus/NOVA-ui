import {
  Calendar,
  ChevronRight,
  Download,
  FileText,
  Filter,
  LayoutList,
  RotateCcw,
  Search,
  CreditCard, // Added missing icon import
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

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
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { InvoicesService } from "~/services/api/invoices";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  INVOICE_STATUSES,
  INVOICE_TYPES,
} from "~/services/api/invoices/invoice.types";
import type { InvoiceStatusEnum } from "~/services/api/invoices/dto";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

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
    onFilterChange("Page", page);
  };

  const handleExport = async () => {
    try {
      const blob = await InvoicesService.exportInvoices(exportDate);
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

  // Logic to show reset button
  const hasActiveFilters =
    filters.Keyword ||
    filters.IssuedFrom ||
    filters.IssuedTo ||
    filters.Status ||
    filters.PaymentMethod ||
    filters.InvoiceType;

  return (
    <div className="flex flex-col h-full bg-muted/10 min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 justify-between shrink-0">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight gap-2">
            Quản lý hóa đơn
          </h1>
        </div>

        {/* Right: Primary Action */}
        {hasAnyRole(AuthLoader.getUser(), [UserRole.HotelManager]) && (
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={"success"}>
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-700" />
                  Xuất dữ liệu hóa đơn
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
                  Chọn ngày cụ thể để xuất báo cáo ngày, hoặc để trống để xuất
                  toàn bộ lịch sử.
                </div>
                <div className="space-y-2">
                  <Label>Ngày xuất báo cáo</Label>
                  <DatePicker
                    value={exportDate}
                    onChange={(date) =>
                      setExportDate(
                        date ? format(date, "yyyy-MM-dd") : undefined
                      )
                    }
                    placeholder="Chọn ngày (Tùy chọn)"
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExportDialogOpen(false);
                    setExportDate(undefined);
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button onClick={handleExport} variant="success">
                  Xác nhận{" "}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* === LEVEL 2: FILTER TOOLBAR === */}
      <div className="px-6 py-3 bg-background border-b flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between shrink-0">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Search */}
          <Input
            startAddon={<Search className="w-4 h-4 text-muted-foreground " />}
            placeholder="Tìm theo mã, khách hàng..."
            value={filters.Keyword || ""}
            onChange={(e) => onFilterChange("Keyword", e.target.value)}
            className="max-w-xs"
          />

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-md border">
            <DatePicker
              value={filters.IssuedFrom}
              onChange={(date) =>
                onFilterChange(
                  "IssuedFrom",
                  date ? date.toISOString() : undefined
                )
              }
              placeholder="Từ ngày"
              className="w-[130px] h-7 text-xs border-0 bg-transparent shadow-none focus:bg-background"
            />
            <span className="text-muted-foreground text-[10px]">➔</span>
            <DatePicker
              value={filters.IssuedTo}
              onChange={(date) =>
                onFilterChange(
                  "IssuedTo",
                  date ? date.toISOString() : undefined
                )
              }
              placeholder="Đến ngày"
              className="w-[130px] h-7 text-xs border-0 bg-transparent shadow-none focus:bg-background"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.Status}
            onValueChange={(val: InvoiceStatusEnum) =>
              onFilterChange("Status", val)
            }
          >
            <SelectTrigger className="w-[160px] h-9 text-xs border-dashed">
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {INVOICE_STATUSES?.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.PaymentMethod}
            onValueChange={(val) =>
              onFilterChange(
                "PaymentMethod",
                val === "all" ? undefined : (val as any)
              )
            }
          >
            <SelectTrigger className="w-[170px] h-9 text-xs border-dashed">
              <div className="flex items-center gap-2 truncate">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Phương thức TT" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((pm) => (
                <SelectItem key={pm.value} value={pm.value}>
                  {pm.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Invoice Type Filter */}
          <Select
            value={filters.InvoiceType}
            onValueChange={(val) =>
              onFilterChange(
                "InvoiceType",
                val === "all" ? undefined : (val as any)
              )
            }
          >
            <SelectTrigger className="w-[160px] h-9 text-xs border-dashed">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Loại hóa đơn" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {INVOICE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground ml-auto sm:ml-0"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* === LEVEL 3: CONTENT AREA === */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto bg-background">{children}</div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pt-4 flex justify-center shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    to="#"
                    onClick={(e: any) => {
                      e?.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={cn(
                      "cursor-pointer",
                      currentPage <= 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {pages[0] > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(1);
                        }}
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
                      isActive={p === currentPage}
                      onClick={(e: any) => {
                        e?.preventDefault();
                        handlePageChange(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

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
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(totalPages);
                        }}
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
                    className={cn(
                      "cursor-pointer",
                      currentPage >= totalPages &&
                        "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}

export default InvoicesViewLayout;
