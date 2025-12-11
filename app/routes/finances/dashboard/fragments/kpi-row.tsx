import {
  CircleDollarSign,
  Wallet,
  BedDouble,
  Receipt,
  BarChart4,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { KpiCard } from "./kpi-card";
import { Skeleton } from "~/components/ui/skeleton";
import type { KpisBaseDto } from "~/services/api/finances/dto";

interface KpiRowProps {
  data?: KpisBaseDto;
  isLoading?: boolean;
}

interface KpiConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  format: "currency" | "percent" | "number";
  subtitle?: string;
  getValue: (d: KpisBaseDto) => number;
  getComparison: (d: KpisBaseDto) => number;
  getVariance: (d: KpisBaseDto) => number;
}

const KPI_METRICS: KpiConfig[] = [
  {
    id: "revenue",
    title: "Tổng doanh thu",
    icon: CircleDollarSign,
    format: "currency",
    getValue: (d) => d.totalRevenue,
    getComparison: (d) => d.revenueComparison,
    getVariance: (d) => d.revenueVariancePercent,
  },
  {
    id: "profit",
    title: "Lợi nhuận ròng",
    icon: Wallet,
    format: "currency",
    getValue: (d) => d.netProfit,
    getComparison: (d) => d.profitComparison,
    getVariance: (d) => d.profitVariancePercent,
  },
  {
    id: "occupancy",
    title: "Tỷ lệ lấp đầy",
    icon: BedDouble,
    format: "percent",
    subtitle: "% phòng có khách",
    getValue: (d) => d.occupancyPercent,
    getComparison: (d) => d.occupancyComparison,
    getVariance: (d) => d.occupancyVariancePoints,
  },
  {
    id: "adr",
    title: "ADR",
    icon: Receipt,
    format: "currency",
    subtitle: "Giá TB / phòng bán",
    getValue: (d) => d.adr,
    getComparison: (d) => d.adrComparison,
    getVariance: (d) => d.adrVariancePercent,
  },
  {
    id: "revpar",
    title: "RevPAR",
    icon: BarChart4,
    format: "currency",
    subtitle: "Doanh thu / phòng có sẵn",
    getValue: (d) => d.revPAR,
    getComparison: (d) => d.revPARComparison,
    getVariance: (d) => d.revPARVariancePercent,
  },
  {
    id: "bookings",
    title: "Số Booking",
    icon: CalendarCheck,
    format: "number",
    getValue: (d) => d.totalBookings,
    getComparison: (d) => d.bookingsComparison,
    getVariance: (d) => d.bookingsVariancePercent,
  },
];

export function KpiRow({ data, isLoading }: KpiRowProps) {
  // 3. System UX: Always handle loading states to prevent layout shifts
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {KPI_METRICS.map((metric) => (
          <KpiCardSkeleton key={metric.id} />
        ))}
      </div>
    );
  }

  // 4. Render Loop
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
      {KPI_METRICS.map((metric) => (
        <KpiCard
          key={metric.id}
          title={metric.title}
          icon={metric.icon}
          format={metric.format}
          value={metric.getValue(data)}
          comparison={metric.getComparison(data)}
          variancePercent={metric.getVariance(data)}
        />
      ))}
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-[140px] flex flex-col justify-between">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
