import {
  CreditCard,
  Filter,
  LayoutList,
  PieChart,
  RotateCcw,
  Tags,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FE_URL } from "~/lib/fe-url";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import type { ExpensesFilter } from "../container/filter.hooks";
import { ExpenseCategories } from "~/services/api/expenses/expenses.types";
import { useAuth } from "~/lib/auth/components";
import { UserRole } from "~/lib/auth/roles";

// --- PROPS ---
interface ExpensesLayoutProps {
  children: React.ReactNode;
  filters: ExpensesFilter;
  updateFilter: (key: keyof ExpensesFilter, value: any) => void;
  resetFilters: () => void;
  totalExpenses: number;
  totalAmount: number;
  isDashboardView?: boolean;
}

export default function ExpensesLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalExpenses,
  totalAmount,
  isDashboardView = false,
}: ExpensesLayoutProps) {
  const currentTab = isDashboardView ? "dashboard" : "list";
  const hasActiveFilters = Boolean(
    filters.fromDate || filters.toDate || filters.categoryId
  );
  const { hasRole } = useAuth();
  return (
    <div className="flex flex-col h-full bg-muted/10 min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-tight">Quản lý chi phí</h1>
          <Separator orientation="vertical" className="h-6" />

          <Tabs value={currentTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger
                value="list"
                asChild
                className="text-xs px-4"
                disabled={hasRole(UserRole.HotelManager)}
              >
                <Link
                  to={FE_URL.dashboard.expenses}
                  className="flex items-center gap-2"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  Danh sách
                </Link>
              </TabsTrigger>
              <TabsTrigger value="dashboard" asChild className="text-xs px-4">
                <Link
                  to={FE_URL.dashboard.expensesDashboard}
                  className="flex items-center gap-2"
                >
                  <PieChart className="w-3.5 h-3.5" />
                  Báo cáo
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          {!isDashboardView && (
            <div className="hidden lg:flex items-center gap-3 mr-4 text-sm bg-muted/50 px-3 py-1.5 rounded-md border">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Số lượng:</span>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {totalExpenses}
                </Badge>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Tổng chi:</span>
                <span className="font-mono font-bold text-primary">
                  {totalAmount.toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {!isDashboardView && (
        <div className="px-6 py-3 bg-background border-b flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mr-2">
              <Filter className="w-4 h-4" />
              Bộ lọc:
            </div>

            <div className="flex items-center gap-2">
              <DatePicker
                value={filters.fromDate}
                onChange={(date) => updateFilter("fromDate", date)}
                placeholder="Từ ngày"
                className="w-[130px] h-9 text-xs"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <DatePicker
                value={filters.toDate}
                onChange={(date) =>
                  updateFilter(
                    "toDate",
                    date ? date.toISOString().split("T")[0] : undefined
                  )
                }
                placeholder="Đến ngày"
                className="w-[130px] h-9 text-xs"
              />
            </div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Select
              value={filters.categoryId}
              onValueChange={(value) =>
                updateFilter("categoryId", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-60 h-9 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Tags className="w-3.5 h-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Tất cả danh mục" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {ExpenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground ml-auto sm:ml-0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      )}

      {/* === LEVEL 3: CONTENT AREA === */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
