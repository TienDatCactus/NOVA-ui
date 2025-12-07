import { useState } from "react";
import { useFinancialDashboard } from "./container/query.hooks";
import { DashboardFilters } from "./fragments/dashboard-filters";
import { KpiCardsSection } from "./components/kpi-cards-section";
import { RevenueBreakdownSection } from "./components/revenue-breakdown-section";
import { BookingMetricsSection } from "./components/booking-metrics-section";
import { RevenueTrendSection } from "./components/revenue-trend-section";
import { FinancialHealthSection } from "./components/financial-health-section";
import { PaymentCollectionSection } from "./components/payment-collection-section";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button"; // Import Button
import { AlertCircle, Download, RefreshCcw } from "lucide-react"; // Import Icons
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"; // Import Alert
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.FinancialReports, Permission.Read);
import type { Route } from "./+types/dashboard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import type { isError } from "util";

export default function FinancialDashboard({}: Route.ComponentProps) {
  const [filters, setFilters] = useState<FinancialReportsListParams>({
    PeriodType: "Today",
    ComparisonType: "PreviousPeriod",
    IncludeTrend: true,
    TrendDays: 14,
  });

  // Lấy thêm trạng thái isError và error
  const { data, isPending, refetch } = useFinancialDashboard(filters);

  // UX Improvement: Loading state cho nút refresh riêng biệt
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-muted pb-8">
      {/* 1. Sticky Header Wrapper */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-muted px-4 py-4 md:px-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-accent-foreground">
              Báo cáo tài chính
            </h1>
            {data && (
              <p className="text-sm text-muted-foreground mt-1">
                {data.periodDescription} • Cập nhật:{" "}
                <span className="font-medium text-accent-foreground">
                  {new Date(data.generatedAt).toLocaleString("vi-VN")}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <Download className="w-4 h-4" /> Xuất Excel
            </Button>
            <DashboardFilters
              filters={filters}
              onFiltersChange={setFilters}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 space-y-8">
        {/* 3. Improved Loading Skeletons */}
        {isPending && (
          <div className="space-y-6 animate-pulse">
            {/* KPI Skeleton Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
              ))}
            </div>

            {/* Chart Skeletons */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        )}

        {/* 4. Dashboard Content */}
        {!isPending && data && (
          <div className="space-y-6">
            {/* 1. KPI Cards - Top Priority */}
            <section>
              <KpiCardsSection
                todayKpis={data.todayKpis}
                thisMonthKpis={data.thisMonthKpis}
                thisYearKpis={data.thisYearKpis}
              />
            </section>

            {/* 2. Revenue Trend - Full Width for Better Visualization */}
            <section>
              <RevenueTrendSection data={data.revenueTrend} />
            </section>

            {/* 3. Booking Operations - New Visual Design */}
            <section>
              <BookingMetricsSection metrics={data.bookingMetrics} />
            </section>

            {/* 4. Revenue Analysis - Side by Side */}
            <section className="grid gap-6 lg:grid-cols-2">
              <RevenueBreakdownSection
                revenueBreakdown={data.revenueBreakdown}
                revenueByChannel={data.revenueByChannel}
              />
              <div className="space-y-6">
                <FinancialHealthSection health={data.financialHealth} />
                <PaymentCollectionSection
                  paymentCollection={data.paymentCollection}
                  otaReceivable={data.otaReceivable}
                />
              </div>
            </section>
          </div>
        )}

        {!isPending && !data && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </EmptyMedia>
              <EmptyTitle>Chưa có dữ liệu tài chính</EmptyTitle>
              <EmptyDescription>
                Không tìm thấy dữ liệu cho khoảng thời gian này. Hãy thử chọn
                một ngày khác hoặc kiểm tra lại kết nối.
              </EmptyDescription>
              <Button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, PeriodType: "ThisMonth" }))
                }
              >
                Xem tháng này
              </Button>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
