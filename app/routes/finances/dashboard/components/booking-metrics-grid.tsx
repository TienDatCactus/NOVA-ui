import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  LogIn,
  LogOut,
  Users,
  Calendar,
  UserCheck,
  Home,
  Activity,
  UserX,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { BookingMetricsDto } from "~/services/api/finances/dto";
import { cn } from "~/lib/utils";

interface BookingMetricsGridProps {
  metrics: BookingMetricsDto;
}

export function BookingMetricsGrid({ metrics }: BookingMetricsGridProps) {
  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Tổng quan vận hành
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* GROUP 1: CRITICAL OPERATIONS (Front Desk Focus) */}
        {/* Dùng màu sắc để định hướng hành động */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OperationCard
            label="Check-in "
            value={metrics.checkIns}
            icon={LogIn}
            intent="success" // Xanh: Việc cần làm vào/tích cực
          />
          <OperationCard
            label="Check-out "
            value={metrics.checkOuts}
            icon={LogOut}
            intent="warning" // Cam: Việc cần làm ra/lưu ý
          />
          <OperationCard
            label="Đang lưu trú"
            value={metrics.inHouse}
            icon={Users}
            intent="info" // Xanh dương: Trạng thái hiện tại
          />
        </div>

        <Separator className="bg-border/60" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
          <StatItem
            label="Tổng booking"
            value={metrics.totalBookings}
            icon={Calendar}
          />
          <StatItem
            label="Booking mới"
            value={metrics.newBookings}
            icon={UserCheck}
          />
          <StatItem
            label="Đêm phòng"
            value={metrics.roomNights}
            sub={`${metrics.averageStay.toFixed(1)} đêm/khách`}
            icon={Home}
          />
          <StatItem label="Walk-in" value={metrics.walkIns} icon={Activity} />

          {/* Exceptions: Chỉ dùng màu đỏ nhạt để cảnh báo nhẹ */}
          <StatItem
            label="No-show"
            value={metrics.noShows}
            icon={UserX}
            intent="danger"
          />
          <StatItem
            label="Đã hủy"
            value={metrics.cancellations}
            sub={`${metrics.cancellationRate.toFixed(1)}%`}
            icon={XCircle}
            intent="danger" // Hoặc để neutral nếu hủy là chuyện bình thường
          />
        </div>
      </CardContent>
    </Card>
  );
}

// --- Sub-components (Local) ---

interface OperationCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  intent: "success" | "warning" | "info";
}

function OperationCard({
  label,
  value,
  icon: Icon,
  intent,
}: OperationCardProps) {
  const styles = {
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400",
    warning:
      "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400",
    info: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400",
  };

  return (
    <div className={cn("flex flex-col p-4 rounded-xl border", styles[intent])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
          {label}
        </span>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  intent?: "neutral" | "danger";
}

function StatItem({
  label,
  value,
  sub,
  icon: Icon,
  intent = "neutral",
}: StatItemProps) {
  return (
    <div className="flex items-start gap-3 group">
      <div
        className={cn(
          "mt-0.5 p-2 rounded-md",
          intent === "danger"
            ? "bg-red-50 text-red-600 dark:bg-red-900/20"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={cn(
              "text-xl font-semibold tracking-tight",
              intent === "danger"
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            )}
          >
            {value}
          </p>
          {sub && (
            <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1 rounded">
              {sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
