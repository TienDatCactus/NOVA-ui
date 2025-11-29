import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { BookingMetricsDto } from "~/services/api/finances/dto";

interface BookingMetricsSectionProps {
  metrics?: BookingMetricsDto;
}

export function BookingMetricsSection({ metrics }: BookingMetricsSectionProps) {
  if (!metrics) return null;

  const metricItems = [
    {
      label: "Tổng đặt phòng",
      value: metrics.totalBookings,
      format: "number",
    },
    {
      label: "Đặt phòng mới",
      value: metrics.newBookings,
      format: "number",
    },
    {
      label: "Walk-in",
      value: metrics.walkIns,
      format: "number",
    },
    {
      label: "Đêm phòng",
      value: metrics.roomNights,
      format: "number",
    },
    {
      label: "Lưu trú TB",
      value: metrics.averageStay,
      format: "decimal",
      suffix: " đêm",
    },
    {
      label: "Nhận phòng",
      value: metrics.checkIns,
      format: "number",
    },
    {
      label: "Trả phòng",
      value: metrics.checkOuts,
      format: "number",
    },
    {
      label: "Đang lưu trú",
      value: metrics.inHouse,
      format: "number",
    },
    {
      label: "Không đến",
      value: metrics.noShows,
      format: "number",
    },
    {
      label: "Đã huỷ",
      value: metrics.cancellations,
      format: "number",
    },
    {
      label: "Tỷ lệ huỷ",
      value: metrics.cancellationRate,
      format: "percent",
    },
  ];

  const formatValue = (
    value: number,
    format: string,
    suffix?: string
  ): string => {
    switch (format) {
      case "currency":
        return value.toLocaleString("vi-VN") + "đ";
      case "percent":
        return value.toFixed(1) + "%";
      case "decimal":
        return value.toFixed(1) + (suffix || "");
      default:
        return value.toLocaleString("vi-VN");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chỉ số đặt phòng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {metricItems.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold">
                {formatValue(item.value, item.format, item.suffix)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
