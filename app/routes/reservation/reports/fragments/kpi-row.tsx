import { BedDouble, LogIn, LogOut, BarChart3 } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { Skeleton } from "~/components/ui/skeleton";
import { useMemo } from "react";

interface BookingDataItem {
  date: string;
  booked: number;
  checkin: number;
  checkout: number;
  available: number;
}

interface KpiRowProps {
  data?: BookingDataItem[];
  isLoading?: boolean;
}

export function KpiRow({ data, isLoading }: KpiRowProps) {
  const kpis = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalAvailable: 0,
        totalBooked: 0,
        todayCheckins: 0,
        todayCheckouts: 0,
        occupancyPercent: 0,
      };
    }

    // Get today's data (last item in array for current date range)
    const todayData = data[data.length - 1];
    const totalRooms = todayData.available + todayData.booked;
    const occupancyPercent =
      totalRooms > 0 ? (todayData.booked / totalRooms) * 100 : 0;

    return {
      totalAvailable: todayData.available,
      totalBooked: todayData.booked,
      todayCheckins: todayData.checkin,
      todayCheckouts: todayData.checkout,
      occupancyPercent,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Tỷ lệ lấp đầy"
        icon={BarChart3}
        value={kpis.occupancyPercent}
        format="percent"
        subtitle="Hiện tại"
      />
      <KpiCard
        title="Phòng trống"
        icon={BedDouble}
        value={kpis.totalAvailable}
        format="number"
        subtitle="Sẵn sàng cho thuê"
      />
      <KpiCard
        title="Check-in hôm nay"
        icon={LogIn}
        value={kpis.todayCheckins}
        format="number"
        subtitle="Khách đến"
      />
      <KpiCard
        title="Check-out hôm nay"
        icon={LogOut}
        value={kpis.todayCheckouts}
        format="number"
        subtitle="Khách trả phòng"
      />
    </div>
  );
}
