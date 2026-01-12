import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";
import type { Route } from "./+types/dashboard";
import { RevenueTrendChart } from "./components/revenue-trend-chart";
import { RevenueStructureChart } from "./components/revenue-structure-chart";
import { useFinancialDashboard } from "./container/query.hooks";
import { DashboardToolbar } from "./fragments/dashboard-toolbar";
import { StatCards } from "./fragments/stat-cards";

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
    IncludeTrend: true,
    TrendDays: 7,
  });

  const { data, isPending, refetch, isError } = useFinancialDashboard(filters);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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
                variant="destructive-outline"
                size="sm"
                onClick={handleRefresh}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* SME Simplified Dashboard */}
        {!isPending && !isError && data && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                Tổng quan ({data.periodDescription})
              </h2>
              <StatCards data={data} />
            </section>

            {/* Revenue Trend Chart */}
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                Xu hướng doanh thu
              </h2>
              <RevenueTrendChart data={data.revenueTrend} />
            </section>

            {/* Revenue Structure Chart */}
            <section className="pb-10">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 pl-1">
                Cơ cấu doanh thu
              </h2>
              <RevenueStructureChart data={data.revenueStructure} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <Skeleton className="h-[350px] w-full rounded-xl" />
      <Skeleton className="h-[350px] w-full rounded-xl" />
    </div>
  );
}
