import {
  endOfMonth,
  endOfQuarter,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
} from "date-fns";
import { Filter, LayoutDashboard } from "lucide-react";
import { redirect, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader, hasRole, UserRole } from "~/lib/auth/auth.loader";
import { DASHBOARD, FE_URL } from "~/lib/fe-url";
import useExpensesFilters from "../container/filter.hooks";
import ExpensesLayout from "../layouts/expenses.layout";
import CategoryChart from "./components/category-chart";
import MetricsCards from "./components/metrics-cards";
import MonthlyTrendChart from "./components/monthly-trend-chart";
import { useDashboardData } from "./container/dashboard.hooks";
export const clientLoader = () => {
  const user = AuthLoader.getUser();
  if (!hasRole(user, UserRole.HotelManager)) {
    throw redirect(DASHBOARD.expenses);
  }
};
export default function ExpenseDashboard() {
  const navigate = useNavigate();
  const { filters, updateFilter } = useExpensesFilters();

  const { totalAmount, byCategory, byMonth, isPending, isEmpty } =
    useDashboardData({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });

  const handleCategoryClick = (category: string) => {
    const searchParams = new URLSearchParams({
      category,
      from: filters.fromDate || "",
      to: filters.toDate || "",
    });
    navigate(`${FE_URL.dashboard.expenses}?${searchParams.toString()}`);
  };

  const setQuickFilter = (
    range: "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear"
  ) => {
    const now = new Date();
    let from: Date, to: Date;

    switch (range) {
      case "thisMonth":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case "thisQuarter":
        from = startOfQuarter(now);
        to = endOfQuarter(now);
        break;
      case "thisYear":
        from = startOfYear(now);
        to = endOfYear(now);
        break;
    }

    updateFilter("fromDate", format(from, "yyyy-MM-dd"));
    updateFilter("toDate", format(to, "yyyy-MM-dd"));
  };

  return (
    <ExpensesLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={() => {}}
      totalExpenses={Object.keys(byMonth).length}
      totalAmount={totalAmount}
      isDashboardView={true}
    >
      <div className="space-y-8 pb-10">
        {/* 1. HEADER & TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary" />
              Tổng quan chi phí
            </h2>
            <p className="text-sm text-muted-foreground">
              Theo dõi dòng tiền chi tiêu và xu hướng tài chính.
            </p>
          </div>
          <div className="flex items-center">
            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setQuickFilter("thisMonth")}
                className="text-xs  font-medium"
              >
                Tháng này
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickFilter("lastMonth")}
                className="text-xs  font-medium"
              >
                Tháng trước
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickFilter("thisQuarter")}
                className="text-xs  font-medium"
              >
                Quý này
              </Button>
              <Button
                variant="outline"
                onClick={() => setQuickFilter("thisYear")}
                className="text-xs  font-medium"
              >
                Năm nay
              </Button>
            </ButtonGroup>
            <div className="ml-2 pl-2">
              <DateRangePicker
                from={filters.fromDate ? new Date(filters.fromDate) : undefined}
                to={filters.toDate ? new Date(filters.toDate) : undefined}
                onRangeChange={(range) => {
                  updateFilter(
                    "fromDate",
                    range.from ? format(range.from, "yyyy-MM-dd") : undefined
                  );
                  updateFilter(
                    "toDate",
                    range.to ? format(range.to, "yyyy-MM-dd") : undefined
                  );
                }}
                placeholder="Tùy chọn"
                className="gap-2"
              />
            </div>
          </div>
        </div>

        {/* 2. CONTENT AREA */}
        {isPending ? (
          <DashboardSkeleton />
        ) : isEmpty ? (
          <DashboardEmptyState onReset={() => setQuickFilter("thisMonth")} />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <section>
              <MetricsCards
                totalAmount={totalAmount}
                //@ts-ignore
                byCategory={byCategory}
                byMonth={byMonth}
              />
            </section>

            {/* Charts Row */}
            <section className="grid gap-6 md:grid-cols-12">
              {/* Trend Chart (Wider) */}
              <div className="md:col-span-7 xl:col-span-6">
                <MonthlyTrendChart byMonth={byMonth} />
              </div>

              {/* Category Chart (Square-ish) */}
              <div className="md:col-span-5 xl:col-span-6">
                <CategoryChart
                  //@ts-ignore
                  byCategory={byCategory}
                  totalAmount={totalAmount}
                  onCategoryClick={handleCategoryClick}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </ExpensesLayout>
  );
}

// --- SUB-COMPONENTS ---

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-12">
        <Skeleton className="md:col-span-8 h-[350px] rounded-xl" />
        <Skeleton className="md:col-span-4 h-[350px] rounded-xl" />
      </div>
    </div>
  );
}

function DashboardEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/10">
      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
        <Filter className="w-8  text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Chưa có dữ liệu chi phí
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Không tìm thấy khoản chi nào trong khoảng thời gian này. Hãy thử chọn
        mốc thời gian khác.
      </p>
      <Button variant="outline" onClick={onReset}>
        Xem tháng này
      </Button>
    </div>
  );
}
