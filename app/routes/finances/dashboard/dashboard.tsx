import { AlertTriangle, Filter, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";
import type { Route } from "./+types/dashboard";
import { BookingMetricsGrid } from "./components/booking-metrics-grid";
import { FinancialHealthIndicators } from "./components/financial-health-indicators";
import { PaymentMethodsTable } from "./components/payment-methods-table";
import {
  ChannelRevenueChart,
  RevenueBreakdownDonut,
} from "./components/revenue-breakdown-charts";
import { RevenueTrendChart } from "./components/revenue-trend-chart";
import { useFinancialDashboard } from "./container/query.hooks";
import { DashboardToolbar } from "./fragments/dashboard-toolbar";
import { KpiRow } from "./fragments/kpi-row";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Báo Cáo Tài Chính - NOVA Hotel Management" },
    {
      name: "description",
      content: "Báo cáo tài chính và doanh thu khách sạn",
    },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.FinancialReports, Permission.Read);

export default function FinancialDashboard({}: Route.ComponentProps) {
  const [filters, setFilters] = useState<FinancialReportsListParams>({
    PeriodType: "ThisMonth",
    ComparisonType: "PreviousPeriod",
    IncludeTrend: true,
    TrendDays: 14,
  });

  const { data, isPending, refetch, isError } = useFinancialDashboard(filters);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // --- Alert Logic ---
  const hasLowCollectionRate =
    (data?.financialHealth.collectionRate ?? 0) <
    (data?.financialHealth.collectionRateTarget ?? 95);
  const hasNegativeProfit = (data?.thisMonthKpis.netProfit ?? 0) < 0;
  const hasSmallSample = (data?.bookingMetrics.totalBookings ?? 0) < 10;

  return (
    <div className="flex flex-col h-full bg-muted/10 min-h-screen">
      <DashboardToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={handleRefresh}
        generatedAt={data?.generatedAt}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 p-6 overflow-y-visible">
        {isPending && <DashboardSkeleton />}

        {isError && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20 text-destructive"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            <AlertDescription className="flex items-center gap-2 mt-1">
              Không thể tải báo cáo tài chính.
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-7 border-destructive/30 hover:bg-destructive/10"
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        {!isPending && !isError && data && (
          <div className="space-y-8 ">
            {(hasLowCollectionRate || hasNegativeProfit || hasSmallSample) && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hasLowCollectionRate && (
                  <Alert variant={"destructive"}>
                    <AlertTriangle className="h-4 w-4 " />
                    <AlertTitle>Tỷ lệ thu tiền thấp</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Hiện tại {data.financialHealth.collectionRate.toFixed(1)}%
                      (Mục tiêu {data.financialHealth.collectionRateTarget}%)
                    </AlertDescription>
                  </Alert>
                )}
                {hasNegativeProfit && (
                  <Alert variant={"warning"}>
                    <TrendingDown className="h-4 w-4 " />
                    <AlertTitle>Lợi nhuận âm</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Cần xem lại chi phí vận hành.
                    </AlertDescription>
                  </Alert>
                )}
                {hasSmallSample && (
                  <Alert variant={"info"}>
                    <Filter className="h-4 w-4 " />
                    <AlertTitle>Mẫu dữ liệu nhỏ</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      Chỉ có {data.bookingMetrics.totalBookings} booking. Xu
                      hướng có thể chưa chính xác.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                Hiệu suất tổng quan ({data.periodDescription})
              </h2>
              <KpiRow
                data={
                  filters.PeriodType === "Today"
                    ? data.todayKpis
                    : data.thisMonthKpis
                }
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueTrendChart data={data.revenueTrend} />
              <BookingMetricsGrid metrics={data.bookingMetrics} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RevenueBreakdownDonut
                data={data.revenueBreakdown}
                totalRevenue={data.thisMonthKpis.totalRevenue}
              />
              <ChannelRevenueChart data={data.revenueByChannel} />
            </section>

            <section className="grid grid-cols-1 pb-10">
              <div className="space-y-6">
                <FinancialHealthIndicators
                  health={data.financialHealth}
                  collectionTarget={data.financialHealth.collectionRateTarget}
                />
                {data.paymentCollection.length > 0 && (
                  <PaymentMethodsTable
                    data={data.paymentCollection}
                    otaReceivable={data.otaReceivable}
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8  px-4 md:px-6 py-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
        <Skeleton className="h-[400px] lg:col-span-1 rounded-xl" />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}
