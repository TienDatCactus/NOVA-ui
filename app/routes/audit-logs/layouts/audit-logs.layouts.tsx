import React from "react";
import { format } from "date-fns";
import {
  Activity,
  Archive,
  CheckCircle2,
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
import { cn } from "~/lib/utils";

import type { AuditListParams } from "~/services/api/audit/audit.types";
import {
  AuditModuleEnum,
  AuditActionEnum,
} from "~/services/api/audit/audit.types";

interface AuditLogsLayoutProps {
  children: React.ReactNode;
  filters: AuditListParams;
  updateFilter: (key: keyof AuditListParams, value: any) => void;
  resetFilters: () => void;
  totalItems: number;
}

const AuditLogsLayout = ({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalItems,
}: AuditLogsLayoutProps) => {
  // Helper để đếm số lượng filter đang active
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

  return (
    <div className="flex flex-col h-full bg-muted/10 p-4 md:p-6 space-y-4">
      {/* === 1. HEADER & KPI === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-background border rounded-xl shadow-sm">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Nhật ký hệ thống
            </h1>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {totalItems.toLocaleString("vi-VN")}
              </span>{" "}
              hoạt động được ghi nhận
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* === 2. FLAT FILTER BAR === */}
      <div className="bg-background border rounded-xl shadow-sm p-1">
        <div className="flex flex-col">
          {/* Row 1: Search & Time (High Priority) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-2">
            {/* Keyword */}
            <div className="lg:col-span-7 relative group">
              <div className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Tìm kiếm theo mô tả, mã đối tượng, nội dung thay đổi..."
                className="pl-9 h-10 border-transparent bg-muted/30 focus:bg-background focus:border-input transition-all"
                value={filters.Keyword || ""}
                onChange={(e) =>
                  updateFilter("Keyword", e.target.value || undefined)
                }
              />
            </div>

            {/* Date Range */}
            <div className="lg:col-span-5">
              <DateRangePicker
                from={filters.FromDate ? new Date(filters.FromDate) : undefined}
                to={filters.ToDate ? new Date(filters.ToDate) : undefined}
                onRangeChange={handleDateRangeChange}
                placeholder="Chọn khoảng thời gian"
                className="h-10 w-full border-transparent bg-muted/30 hover:bg-muted/50 focus:bg-background focus:border-input"
              />
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Row 2: Categorical Filters (Medium Priority) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 p-2 bg-muted/5">
            {/* Module */}
            <div className="lg:col-span-1">
              <Select
                value={filters.Module || "all"}
                onValueChange={(value) =>
                  updateFilter("Module", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">
                      {filters.Module
                        ? AuditModuleEnum.find(
                            (m) => m.value === filters.Module
                          )?.label
                        : "Tất cả phân hệ"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phân hệ</SelectItem>
                  {AuditModuleEnum.map((m) => {
                    const Icon = m.icon;
                    return (
                      <SelectItem key={m.value} value={m.value}>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="w-3.5 h-3.5 opacity-70" /> {m.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Action */}
            <div className="lg:col-span-1">
              <Select
                value={filters.Action || "all"}
                onValueChange={(value) =>
                  updateFilter("Action", value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background border-muted-foreground/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    <span className="font-medium text-foreground">
                      {filters.Action
                        ? AuditActionEnum.find(
                            (a) => a.value === filters.Action
                          )?.label
                        : "Tất cả hành động"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  {AuditActionEnum.map((a) => {
                    const Icon = a.icon;
                    return (
                      <SelectItem key={a.value} value={a.value}>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon className="w-3.5 h-3.5 opacity-70" /> {a.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* User */}
            <div className="lg:col-span-1 relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                placeholder="Người dùng..."
                className="pl-8 h-9 text-xs bg-background border-muted-foreground/20 focus-visible:ring-1"
                value={filters.Username || ""}
                onChange={(e) =>
                  updateFilter("Username", e.target.value || undefined)
                }
              />
            </div>

            {/* Status Toggles (Grouped) */}
            <div className="lg:col-span-2 flex items-center gap-2">
              {/* Success Only */}
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
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn(
                      "w-3.5 h-3.5",
                      filters.Success !== false
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      filters.Success !== false
                        ? "text-green-700"
                        : "text-muted-foreground"
                    )}
                  >
                    Chỉ thành công
                  </span>
                </div>
                <Switch
                  checked={filters.Success ?? true}
                  className="scale-75 data-[state=checked]:bg-green-600"
                  // onClick handled by parent div
                />
              </div>

              {/* Archived */}
              <div
                className={cn(
                  "flex-1 flex items-center justify-between px-3 h-9 rounded-md border cursor-pointer transition-all select-none",
                  filters.IsArchived
                    ? "bg-orange-50/50 border-orange-200"
                    : "bg-background border-muted-foreground/20 hover:bg-muted"
                )}
                onClick={() => updateFilter("IsArchived", !filters.IsArchived)}
              >
                <div className="flex items-center gap-2">
                  <Archive
                    className={cn(
                      "w-3.5 h-3.5",
                      filters.IsArchived
                        ? "text-orange-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      filters.IsArchived
                        ? "text-orange-700"
                        : "text-muted-foreground"
                    )}
                  >
                    Lưu trữ
                  </span>
                </div>
                <Switch
                  checked={filters.IsArchived ?? false}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                  // onClick handled by parent div
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === 3. CONTENT TABLE === */}
      <main>{children}</main>
    </div>
  );
};

export default AuditLogsLayout;
