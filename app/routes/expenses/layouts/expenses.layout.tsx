import React from "react";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { ExpensesFilter } from "../container/filter.hooks";

interface ExpensesLayoutProps {
  children: React.ReactNode;
  filters: ExpensesFilter;
  updateFilter: (key: keyof ExpensesFilter, value: any) => void;
  resetFilters: () => void;
  totalExpenses: number;
  totalAmount: number;
}

const EXPENSE_CATEGORIES = [
  { value: "Procurement", label: "Mua sắm" },
  { value: "Salary", label: "Lương" },
  { value: "Utilities", label: "Tiện ích" },
  { value: "Maintenance", label: "Bảo trì" },
  { value: "Office", label: "Văn phòng" },
  { value: "Other", label: "Khác" },
];

const PAYMENT_METHODS = [
  { value: "Cash", label: "Tiền mặt" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "CreditCard", label: "Thẻ tín dụng" },
  { value: "DebitCard", label: "Thẻ ghi nợ" },
  { value: "EWallet", label: "Ví điện tử" },
];

const ExpensesLayout = ({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalExpenses,
  totalAmount,
}: ExpensesLayoutProps) => {
  const hasActiveFilters = Boolean(
    filters.fromDate ||
      filters.toDate ||
      filters.categoryId ||
      filters.paymentMethod
  );

  return (
    <div className="grid gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Quản lý chi phí</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalExpenses}
              </span>{" "}
              chi phí
            </span>
            <span className="text-muted-foreground">•</span>
            <span>
              Tổng tiền:{" "}
              <span className="font-semibold text-foreground">
                {totalAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Từ ngày
            </label>
            <DatePicker
              value={filters.fromDate}
              onChange={(date: Date | undefined) =>
                updateFilter(
                  "fromDate",
                  date ? date.toISOString().split("T")[0] : undefined
                )
              }
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Đến ngày
            </label>
            <DatePicker
              value={filters.toDate}
              onChange={(date: Date | undefined) =>
                updateFilter(
                  "toDate",
                  date ? date.toISOString().split("T")[0] : undefined
                )
              }
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Danh mục
            </label>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(value) =>
                updateFilter("categoryId", value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Phương thức
            </label>
            <Select
              value={filters.paymentMethod || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "paymentMethod",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-transparent">
                Reset
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-10"
              >
                <RotateCcw className="h-4 w-4" />
                Đặt lại
              </Button>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default ExpensesLayout;
