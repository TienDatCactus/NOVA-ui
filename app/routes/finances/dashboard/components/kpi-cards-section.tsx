import type { KpisBaseDto } from "~/services/api/finances/dto";
import { KpiCard } from "./kpi-card";

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
  return (
    <div className="space-y-6">
      {/* Main KPI Cards - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hôm nay</h3>
          {todayKpis && (
            <>
              <KpiCard
                title="Doanh thu"
                value={todayKpis.totalRevenue}
                comparison={todayKpis.revenueComparison}
                variancePercent={todayKpis.revenueVariancePercent}
                format="currency"
              />
              <KpiCard
                title="Lợi nhuận ròng"
                value={todayKpis.netProfit}
                comparison={todayKpis.profitComparison}
                variancePercent={todayKpis.profitVariancePercent}
                format="currency"
              />
            </>
          )}
        </div>

        {/* This Month Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tháng này</h3>
          {thisMonthKpis && (
            <>
              <KpiCard
                title="Doanh thu"
                value={thisMonthKpis.totalRevenue}
                comparison={thisMonthKpis.revenueComparison}
                variancePercent={thisMonthKpis.revenueVariancePercent}
                format="currency"
              />
              <KpiCard
                title="Lợi nhuận ròng"
                value={thisMonthKpis.netProfit}
                comparison={thisMonthKpis.profitComparison}
                variancePercent={thisMonthKpis.profitVariancePercent}
                format="currency"
              />
            </>
          )}
        </div>

        {/* This Year Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Năm nay</h3>
          {thisYearKpis && (
            <>
              <KpiCard
                title="Doanh thu"
                value={thisYearKpis.totalRevenue}
                comparison={thisYearKpis.revenueComparison}
                variancePercent={thisYearKpis.revenueVariancePercent}
                format="currency"
              />
              <KpiCard
                title="Lợi nhuận ròng"
                value={thisYearKpis.netProfit}
                comparison={thisYearKpis.profitComparison}
                variancePercent={thisYearKpis.profitVariancePercent}
                format="currency"
              />
            </>
          )}
        </div>
      </div>

      {/* Mini Metrics Row - 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {thisMonthKpis && (
          <>
            <KpiCard
              title="Tỷ lệ lấp đầy"
              value={thisMonthKpis.occupancyPercent}
              variancePercent={thisMonthKpis.occupancyVariancePoints}
              format="percent"
              subtitle={thisMonthKpis.periodLabel}
            />
            <KpiCard
              title="ADR (Giá phòng TB)"
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
              title="Số đặt phòng"
              value={thisMonthKpis.totalBookings}
              comparison={thisMonthKpis.bookingsComparison}
              variancePercent={thisMonthKpis.bookingsVariancePercent}
              format="number"
            />
          </>
        )}
      </div>
    </div>
  );
}
