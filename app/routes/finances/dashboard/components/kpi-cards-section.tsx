import {
  DollarSign,
  TrendingUp,
  BedDouble,
  Users,
  CalendarCheck,
} from "lucide-react"; // Gợi ý thêm Icon để dashboard sinh động hơn
import type { KpisBaseDto } from "~/services/api/finances/dto";
import { KpiCard } from "../fragments/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Giả sử bạn dùng Shadcn UI

interface KpiCardsSectionProps {
  todayKpis?: KpisBaseDto;
  thisMonthKpis?: KpisBaseDto;
  thisYearKpis?: KpisBaseDto;
}

export function KpiCardsSection({
  todayKpis,
  thisMonthKpis,
  thisYearKpis,
}: KpiCardsSectionProps) {
  // 1. Cấu hình hóa dữ liệu để render vòng lặp (DRY)
  const periods = [
    {
      label: "Hôm nay",
      data: todayKpis,
      highlight: false, // Dùng để style riêng nếu cần
    },
    {
      label: "Tháng này",
      data: thisMonthKpis,
      highlight: true, // Tháng này thường là trọng tâm
    },
    {
      label: "Năm nay",
      data: thisYearKpis,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* SECTION 1: FINANCIAL OVERVIEW (Doanh thu & Lợi nhuận) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {periods.map((period, index) => (
          <div key={index} className="flex flex-col space-y-4">
            {/* Header của cột */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <CalendarCheck className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                {period.label}
              </h3>
            </div>

            {/* Nội dung KPI */}
            {period.data ? (
              <div className="space-y-4">
                <KpiCard
                  title="Doanh thu"
                  icon={
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  } // Truyền icon vào nếu KpiCard hỗ trợ
                  value={period.data.totalRevenue}
                  comparison={period.data.revenueComparison}
                  variancePercent={period.data.revenueVariancePercent}
                  format="currency"
                />
                <KpiCard
                  title="Lợi nhuận ròng"
                  icon={
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  }
                  value={period.data.netProfit}
                  comparison={period.data.profitComparison}
                  variancePercent={period.data.profitVariancePercent}
                  format="currency"
                />
              </div>
            ) : (
              // Skeleton loading state nếu data chưa có
              <div className="space-y-4 opacity-50">
                <div className="h-24 bg-muted rounded-lg animate-pulse" />
                <div className="h-24 bg-muted rounded-lg animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SECTION 2: OPERATIONAL METRICS (Chỉ số vận hành - Tháng này) */}
      {thisMonthKpis && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary" />
              Hiệu suất vận hành (Tháng này)
            </h3>
            {/* Có thể thêm badge hoặc filter nhỏ ở đây */}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Tỷ lệ lấp đầy"
              value={thisMonthKpis.occupancyPercent}
              variancePercent={thisMonthKpis.occupancyVariancePoints} // Lưu ý: Points khác Percent
              format="percent"
              subtitle={thisMonthKpis.periodLabel}
              className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800" // Highlight nhẹ
            />
            <KpiCard
              title="ADR (Giá TB)"
              value={thisMonthKpis.adr}
              comparison={thisMonthKpis.adrComparison}
              variancePercent={thisMonthKpis.adrVariancePercent}
              format="currency"
            />
            <KpiCard
              title="RevPAR"
              value={thisMonthKpis.revPAR}
              comparison={thisMonthKpis.revPARComparison}
              variancePercent={thisMonthKpis.revPARVariancePercent}
              format="currency"
            />
            <KpiCard
              title="Tổng Booking"
              icon={<Users className="w-4 h-4" />}
              value={thisMonthKpis.totalBookings}
              comparison={thisMonthKpis.bookingsComparison}
              variancePercent={thisMonthKpis.bookingsVariancePercent}
              format="number"
            />
          </div>
        </div>
      )}
    </div>
  );
}
