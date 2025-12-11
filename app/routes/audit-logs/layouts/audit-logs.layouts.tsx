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
  RotateCcw,
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
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { cn, formatMoney } from "~/lib/utils";

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
                Tổng <strong>{formatMoney(totalItems).vndFormatted}</strong> bản
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
                  variant="success-ghost"
                  size="sm"
                  onClick={() => setOpenExportDialog(true)}
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
                  variant="info-ghost"
                  size="sm"
                  onClick={() => setOpenArchiveDialog(true)}
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
                  variant="destructive-ghost"
                  size="sm"
                  onClick={() => setOpenCleanupDialog(true)}
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
          <div className="flex items-center gap-2 p-2">
            <Input
              placeholder="Tìm kiếm nội dung, mã đối tượng, mô tả..."
              startAddon={<Search className="w-4 h-4 text-muted-foreground" />}
              value={filters.Keyword || ""}
              onChange={(e) =>
                updateFilter("Keyword", e.target.value || undefined)
              }
            />
            <div>
              <DateRangePicker
                from={filters.FromDate ? new Date(filters.FromDate) : undefined}
                to={filters.ToDate ? new Date(filters.ToDate) : undefined}
                onRangeChange={handleDateRangeChange}
                placeholder="Khoảng thời gian"
              />
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="destructive-ghost"
                onClick={resetFilters}
                title="Xóa bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <Separator className="opacity-50" />

          <div className="flex items-center justify-evenly gap-2 p-2 bg-muted/5">
            <div>
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

            <div>
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

            <div>
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
            </div>

            <div
              className={cn(
                "w-40 flex items-center justify-between px-3 h-9 rounded-md border cursor-pointer transition-all select-none",
                filters.Success !== false
                  ? "bg-green-50/50 dark:bg-green-300/20   border-green-200 dark:border-green-600"
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
                      ? "text-green-700 dark:text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  Thành công
                </span>
              </div>
              <Switch
                checked={filters.Success ?? true}
                className=" data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 dark:data-[state=checked]:bg-green-600"
              />
            </div>

            <div
              className={cn(
                "w-40 flex items-center justify-between px-3 h-9 rounded-md border cursor-pointer transition-all select-none",
                filters.IsArchived
                  ? "bg-primary/10 border-primary/20"
                  : "bg-background border-muted-foreground/20 hover:bg-muted"
              )}
              onClick={() => updateFilter("IsArchived", !filters.IsArchived)}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <Archive
                  className={cn(
                    "w-3.5 h-3.5",
                    filters.IsArchived
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span
                  className={
                    filters.IsArchived
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                >
                  Đã lưu trữ
                </span>
              </div>
              <Switch checked={filters.IsArchived ?? false} />
            </div>
          </div>
        </div>
      </div>

      {/* === 3. CONTENT AREA === */}
      <main className="flex-1 bg-background  overflow-hidden flex flex-col relative min-h-0">
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </main>

      <Pagination>
        <PaginationContent className="w-full justify-between">
          <PaginationItem>
            <PaginationPrevious
              to="#"
              onClick={(e) => {
                e.preventDefault();
                updateFilter("Page", Math.max(1, currentPage - 1));
              }}
              className="border"
            />
          </PaginationItem>
          <PaginationItem className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label>Số bản ghi mỗi trang:</Label>
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
            </div>
            <p className="text-muted-foreground text-sm " aria-live="polite">
              Trang <span className="text-foreground">{currentPage}</span> /{" "}
              <span className="text-foreground">{totalPages}</span>
            </p>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              to="#"
              onClick={(e) => {
                e.preventDefault();
                updateFilter("Page", Math.min(totalPages, currentPage + 1));
              }}
              className="border"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

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
