import { useState } from "react";
import { useFinancialDashboard } from "./container/query.hooks";
import { DashboardFilters } from "./components/dashboard-filters";
import { KpiCardsSection } from "./components/kpi-cards-section";
import { RevenueBreakdownSection } from "./components/revenue-breakdown-section";
import { BookingMetricsSection } from "./components/booking-metrics-section";
import { RevenueTrendSection } from "./components/revenue-trend-section";
import { FinancialHealthSection } from "./components/financial-health-section";
import { PaymentCollectionSection } from "./components/payment-collection-section";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent } from "~/components/ui/card";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";
import type { Route } from "./+types/dashboard";

export default function FinancialDashboard({}: Route.ComponentProps) {
  const [filters, setFilters] = useState<FinancialReportsListParams>({
    PeriodType: "Today",
    ComparisonType: "PreviousPeriod",
    IncludeTrend: true,
    TrendDays: 14,
  });

  const { data, isPending, refetch } = useFinancialDashboard(filters);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo tài chính</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.periodDescription} • Cập nhật lúc{" "}
              {new Date(data.generatedAt).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
      />

      {/* Loading State */}
      {isPending && (
        <div className="space-y-6">
          <Skeleton className="h-[200px]" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {data && (
        <>
          {/* KPI Cards */}
          <KpiCardsSection
            todayKpis={data.todayKpis}
            thisMonthKpis={data.thisMonthKpis}
            thisYearKpis={data.thisYearKpis}
          />

          {/* Revenue Breakdown & Booking Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueBreakdownSection
              revenueBreakdown={data.revenueBreakdown}
              revenueByChannel={data.revenueByChannel}
            />
            <BookingMetricsSection metrics={data.bookingMetrics} />
          </div>

          {/* Revenue Trend Chart */}
          <RevenueTrendSection data={data.revenueTrend} />

          {/* Financial Health & Payment Collection */}
          <div className="grid gap-6 lg:grid-cols-2">
            <FinancialHealthSection health={data.financialHealth} />
            <PaymentCollectionSection
              paymentCollection={data.paymentCollection}
              otaReceivable={data.otaReceivable}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!isPending && !data && (
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium">Không có dữ liệu</p>
              <p className="text-sm text-muted-foreground">
                Thử chọn khoảng thời gian khác
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
