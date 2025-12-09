import { addDays, format, isSameDay, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  HandPlatter,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/service-orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đơn Hàng Dịch Vụ - NOVA Hotel Management" },
    { name: "description", content: "Quản lý đơn hàng dịch vụ" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Orders, Permission.Read);

import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn, formatMoney } from "~/lib/utils";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import { STATUS_OPTIONS } from "~/services/api/services/service.types";
import type { Route } from "./+types/service-orders";
import ServiceOrderCard from "./components/service-order-list/service-order-card";
import { useServiceOrderList } from "./container/service-order/query.hooks";

type ServiceOrderStatus = ServiceOrderDetailDto["status"] | "All";

export default function ServiceOrderLayout({}: Route.ComponentProps) {
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const { data: orders, isPending } = useServiceOrderList(formattedDate);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders?.length || 0 };
    STATUS_OPTIONS.forEach((opt) => {
      counts[opt.value] = 0;
    });

    orders?.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "All") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);
  const dailySummary = useMemo(() => {
    if (!orders) return { total: 0, count: 0 };
    const validOrders = orders.filter((o) => o.status !== "Cancelled");
    const total = validOrders.reduce(
      (acc, curr) => acc + (curr.quantity || 0),
      0
    );
    return { total, count: validOrders.length };
  }, [orders]);

  // --- HANDLERS ---
  const handlePrevDay = () =>
    setSelectedDate((prev) => (prev ? subDays(prev, 1) : new Date()));
  const handleNextDay = () =>
    setSelectedDate((prev) => (prev ? addDays(prev, 1) : new Date()));
  const handleToday = () => setSelectedDate(new Date());

  const isToday = selectedDate && isSameDay(selectedDate, new Date());

  return (
    <div className="flex h-full flex-col bg-muted/5">
      {/* --- HEADER SECTION --- */}
      <div className="flex-shrink-0 bg-background border-b z-10 shadow-sm">
        {/* Top Row: Title & Date Nav */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Quản lý Đơn Dịch Vụ
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{dailySummary.count} yêu cầu</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="font-mono font-medium text-foreground">
                {formatMoney(dailySummary.total).vndFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>doanh thu ước tính</span>
            </div>
          </div>

          {/* Date Toolbar */}
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePrevDay}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ngày trước</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-[140px] border-none bg-transparent shadow-none hover:bg-background h-8 font-medium text-sm text-center"
                placeholder="Chọn ngày"
              />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextDay}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ngày sau</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!isToday && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-8 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Hôm nay
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Tabs */}
        <div className="px-6 pb-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 border-b border-transparent">
            {STATUS_OPTIONS.map((status) => (
              <StatusTab
                key={status.value}
                label={status.label}
                count={statusCounts[status.value]}
                isActive={statusFilter === status.value}
                statusColor={getServiceStatusColor(status.value)}
                onClick={() =>
                  setStatusFilter(status.value as ServiceOrderStatus)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- ORDER LIST CONTENT --- */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6 pb-20 max-w-[1920px] mx-auto">
            {isPending ? (
              <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500/50" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Đang đồng bộ dữ liệu dịch vụ...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex h-[50vh] flex-col items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HandPlatter />
                    </EmptyMedia>
                    <EmptyTitle>Không có đơn dịch vụ</EmptyTitle>
                    <EmptyDescription>
                      {statusFilter === "All"
                        ? `Không có dịch vụ nào trong ngày ${format(selectedDate || new Date(), "dd/MM")}.`
                        : "Không tìm thấy đơn dịch vụ nào ở trạng thái này."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              // --- GRID LAYOUT ---
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="relative">
                    <ServiceOrderCard order={order} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// === HELPER COMPONENTS ===

function StatusTab({
  label,
  count = 0,
  isActive,
  onClick,
  statusColor = "bg-primary",
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  statusColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all select-none border-b-2 outline-none",
        isActive
          ? "text-foreground border-blue-600"
          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
            isActive
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function getServiceStatusColor(status: string) {
  switch (status) {
    case "Scheduled":
      return "bg-blue-500";
    case "InProgress":
      return "bg-orange-500";
    case "Completed":
      return "bg-emerald-500";
    case "Cancelled":
      return "bg-destructive";
    default:
      return "bg-primary";
  }
}
