import React, { useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  Archive,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Download,
  Eraser,
  Filter,
  LayoutGrid,
  MousePointerClick,
  Search,
  User,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";

import type { AuditListParams } from "~/services/api/audit/audit.types";
import {
  AuditModuleEnum,
  AuditActionEnum,
} from "~/services/api/audit/audit.types";

// Import các dialog đã refactor ở các bước trước
import ArchiveAuditDialog from "../fragments/archive-audit.dialog";
import CleanupAuditDialog from "../fragments/cleanup-audit.dialog";
import ExportAuditDialog from "../fragments/export-audit.dialog";
import users from "~/routes/users/users";
import { useUsers } from "~/routes/users/container/query.hooks";

interface AuditLogsLayoutProps {
  children: React.ReactNode;
  filters: AuditListParams;
  updateFilter: (key: keyof AuditListParams, value: any) => void;
  resetFilters: () => void;
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
}

const AuditLogsLayout = ({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalItems,
  totalPages = 1,
  currentPage = 1,
}: AuditLogsLayoutProps) => {
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [openCleanupDialog, setOpenCleanupDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const { data: users } = useUsers();
  // Đếm số lượng filter đang active
  const activeFiltersCount = [
    filters.Keyword,
    filters.FromDate,
    filters.ToDate,
    filters.Module,
    filters.Action,
    filters.UserId,
    filters.Username,
    filters.IsArchived,
    filters.Success === false,
  ].filter((v) => v !== undefined && v !== "" && v !== false).length;

  const handleDateRangeChange = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    updateFilter(
      "FromDate",
      range.from ? format(range.from, "yyyy-MM-dd") : undefined
    );
    updateFilter(
      "ToDate",
      range.to ? format(range.to, "yyyy-MM-dd") : undefined
    );
  };

  const getPageNumbers = () => {
    const delta = 1;
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      // Add ellipsis after first if needed
      if (start > 2) {
        pages.push("ellipsis");
      }

      // Add pages around current
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last if needed
      if (end < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 p-4 md:p-6 space-y-4">
      {/* === 1. TOP BAR: TITLE & DATA MANAGEMENT ACTIONS === */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-background border rounded-xl shadow-sm text-primary">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Lịch sử truy vấn
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>
                Tổng <strong>{totalItems.toLocaleString("vi-VN")}</strong> bản
                ghi
              </span>
            </div>
          </div>
        </div>

        {/* Data Lifecycle Actions Group */}
        <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border shadow-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenExportDialog(true)}
                  className="gap-2 text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Xuất dữ liệu</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tải xuống báo cáo (Excel/CSV)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenArchiveDialog(true)}
                  className="gap-2 text-orange-700 hover:text-orange-800 hover:bg-orange-50"
                >
                  <Archive className="w-4 h-4" />
                  <span className="hidden sm:inline">Lưu trữ</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Di chuyển logs cũ vào kho lưu trữ (Archive)
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenCleanupDialog(true)}
                  className="gap-2 text-red-700 hover:text-red-800 hover:bg-red-50"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="hidden sm:inline">Dọn dẹp</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Xóa vĩnh viễn logs cũ theo chính sách
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* === 2. FILTER BAR (FLAT DESIGN) === */}
      <div className="bg-background border rounded-xl shadow-sm p-1">
        <div className="flex flex-col">
          {/* Row 1: Search & Time */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-2">
            <div className="lg:col-span-7 relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm kiếm nội dung, mã đối tượng, mô tả..."
                className="pl-9 h-10 border-transparent bg-muted/30 focus:bg-background focus:border-input transition-all"
                value={filters.Keyword || ""}
                onChange={(e) =>
                  updateFilter("Keyword", e.target.value || undefined)
                }
              />
            </div>
            <div className="lg:col-span-5 flex gap-2">
              <DateRangePicker
                from={filters.FromDate ? new Date(filters.FromDate) : undefined}
                to={filters.ToDate ? new Date(filters.ToDate) : undefined}
                onRangeChange={handleDateRangeChange}
                placeholder="Khoảng thời gian"
                className="h-10 w-full border-transparent bg-muted/30 hover:bg-muted/50 focus:bg-background focus:border-input"
              />
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFilters}
                  className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Xóa bộ lọc"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Row 2: Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 p-2 bg-muted/5">
            <div className="lg:col-span-1">
              <Select
                value={filters.Module || "all"}
                onValueChange={(val) =>
                  updateFilter("Module", val === "all" ? undefined : val)
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground truncate">
                      {filters.Module
                        ? AuditModuleEnum.find(
                            (m) => m.value === filters.Module
                          )?.label
                        : "Tất cả Phân hệ"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phân hệ</SelectItem>
                  {AuditModuleEnum.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2 text-sm">
                        <m.icon className="w-3.5 h-3.5 opacity-70" /> {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-1">
              <Select
                value={filters.Action || "all"}
                onValueChange={(val) =>
                  updateFilter("Action", val === "all" ? undefined : val)
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground truncate">
                      {filters.Action
                        ? AuditActionEnum.find(
                            (a) => a.value === filters.Action
                          )?.label
                        : "Tất cả Hành động"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  {AuditActionEnum.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      <div className="flex items-center gap-2 text-sm">
                        <a.icon className="w-3.5 h-3.5 opacity-70" /> {a.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select
              value={filters.UserId || "all"}
              onValueChange={(value) =>
                updateFilter("UserId", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="h-9 text-xs bg-background w-40 border-muted-foreground/20">
                {filters.UserId ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Đã chọn
                  </span>
                ) : (
                  "Tất cả người dùng"
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người dùng</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3.5 h-3.5 opacity-70" />{" "}
                      {user.fullName} - ({user.roles})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="lg:col-span-2 flex gap-2">
              <div
                className={cn(
                  "flex-1 flex items-center justify-between px-3 h-9 rounded-md border cursor-pointer transition-all select-none",
                  filters.Success !== false
                    ? "bg-green-50/50 border-green-200"
                    : "bg-background border-muted-foreground/20 hover:bg-muted"
                )}
                onClick={() =>
                  updateFilter(
                    "Success",
                    filters.Success === false ? true : false
                  )
                }
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2
                    className={cn(
                      "w-3.5 h-3.5",
                      filters.Success !== false
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={
                      filters.Success !== false
                        ? "text-green-700"
                        : "text-muted-foreground"
                    }
                  >
                    Thành công
                  </span>
                </div>
                <Switch
                  checked={filters.Success ?? true}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>

              <div
                className={cn(
                  "flex-1 flex items-center justify-between px-3 h-9 rounded-md border cursor-pointer transition-all select-none",
                  filters.IsArchived
                    ? "bg-orange-50/50 border-orange-200"
                    : "bg-background border-muted-foreground/20 hover:bg-muted"
                )}
                onClick={() => updateFilter("IsArchived", !filters.IsArchived)}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Archive
                    className={cn(
                      "w-3.5 h-3.5",
                      filters.IsArchived
                        ? "text-orange-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={
                      filters.IsArchived
                        ? "text-orange-700"
                        : "text-muted-foreground"
                    }
                  >
                    Đã lưu trữ
                  </span>
                </div>
                <Switch
                  checked={filters.IsArchived ?? false}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === 3. CONTENT AREA === */}
      <main className="flex-1 bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </main>

      <div className="bg-background border rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select
              value={String(filters.PageSize || 20)}
              onValueChange={(val) => updateFilter("PageSize", Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>/ trang</span>
          </div>

          {/* Pagination Navigation */}
          <Pagination>
            <PaginationContent>
              {/* First Page */}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    updateFilter("Page", 1);
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
              </PaginationItem>

              {/* Previous Page */}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    updateFilter("Page", Math.max(1, currentPage - 1));
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
              </PaginationItem>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.preventDefault();
                        updateFilter("Page", page);
                      }}
                    >
                      {page}
                    </Button>
                  )}
                </PaginationItem>
              ))}

              {/* Next Page */}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    updateFilter("Page", Math.min(totalPages, currentPage + 1));
                  }}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </PaginationItem>

              {/* Last Page */}
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.preventDefault();
                    updateFilter("Page", totalPages);
                  }}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Page Info */}
          <div className="text-sm text-muted-foreground">
            Trang{" "}
            <span className="font-medium text-foreground">{currentPage}</span> /{" "}
            {totalPages}
            {" · "}
            <span className="font-medium text-foreground">
              {totalItems.toLocaleString("vi-VN")}
            </span>{" "}
            kết quả
          </div>
        </div>
      </div>

      {/* === DIALOGS === */}
      <ExportAuditDialog
        open={openExportDialog}
        onOpenChange={setOpenExportDialog}
      />
      <ArchiveAuditDialog
        open={openArchiveDialog}
        onOpenChange={setOpenArchiveDialog}
      />
      <CleanupAuditDialog
        open={openCleanupDialog}
        onOpenChange={setOpenCleanupDialog}
      />
    </div>
  );
};

export default AuditLogsLayout;
