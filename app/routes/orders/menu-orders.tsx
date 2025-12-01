import { addDays, format, isSameDay, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Loader2,
  PackageOpen,
  UtensilsCrossed,
} from "lucide-react";
import { useMemo, useState } from "react";

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
import {
  ORDER_STATUSES,
  type OrderStatus,
} from "~/services/api/orders/order.types";
import type { Route } from "./+types/menu-orders";
import OrderCard from "./components/menu-order-list/order-card";
import OrderDetailSheet from "./components/menu-order-list/order-detail.sheet";
import { usePOSOrderList } from "./container/pos-orders/query.hooks";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";

// Extend OrderStatus to include 'All' for the UI filter
type FilterStatus = OrderStatus | "All";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedOrder, setSelectedOrder] = useState<POSOrderDetailDto | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  // --- DATA FETCHING ---
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const { data: orders, isPending } = usePOSOrderList(formattedDate);

  // --- COMPUTED VALUES ---

  // 1. Calculate counts for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: orders?.length || 0 };
    ORDER_STATUSES.forEach((status) => {
      counts[status.value] = 0;
    });

    orders?.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    return counts;
  }, [orders]);

  // 2. Filter the list
  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders?.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  // 3. Revenue Summary (Client-side estimation)
  const dailySummary = useMemo(() => {
    if (!orders) return { total: 0, count: 0 };
    const validOrders = orders.filter((o) => o.status !== "Cancelled");
    const total = validOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    return { total, count: validOrders.length };
  }, [orders]);

  // --- HANDLERS ---
  const handlePrevDay = () =>
    setSelectedDate((prev) => (prev ? subDays(prev, 1) : new Date()));
  const handleNextDay = () =>
    setSelectedDate((prev) => (prev ? addDays(prev, 1) : new Date()));
  const handleToday = () => setSelectedDate(new Date());

  const handleOrderClick = (order: POSOrderDetailDto) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  };

  const handleSheetClose = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      // Delay clearing selected order for smooth animation
      setTimeout(() => setSelectedOrder(null), 300);
    }
  };

  const isToday = selectedDate && isSameDay(selectedDate, new Date());

  return (
    <div className="flex h-full flex-col bg-muted/5">
      {/* === HEADER & TOOLBAR === */}
      <div className="flex-shrink-0 bg-background border-b z-10">
        {/* Top Row: Title & Date Nav */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Quản lý Đơn F&B
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{dailySummary.count} đơn hiệu lực</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="font-mono font-medium text-foreground">
                {formatMoney(dailySummary.total).vndFormatted}
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>doanh thu ước tính</span>
            </div>
          </div>

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
                  className="h-8 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5"
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
            {ORDER_STATUSES.map((status) => (
              <StatusTab
                key={status.value}
                label={status.label}
                count={statusCounts[status.value]}
                isActive={statusFilter === status.value}
                statusColor={getStatusColor(status.value)}
                onClick={() => setStatusFilter(status.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- ORDER LIST SECTION --- */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6 pb-20 max-w-[1920px] mx-auto">
            {isPending ? (
              <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                  Đang đồng bộ dữ liệu...
                </p>
              </div>
            ) : filteredOrders?.length === 0 ? (
              <div className="flex h-[50vh] flex-col items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia
                      variant="icon"
                      className="bg-muted/50 rounded-full p-4"
                    >
                      <PackageOpen className="h-8 w-8 text-muted-foreground/50" />
                    </EmptyMedia>
                    <EmptyTitle>Không có đơn hàng</EmptyTitle>
                    <EmptyDescription>
                      {statusFilter === "All"
                        ? `Không có đơn hàng nào trong ngày ${format(selectedDate || new Date(), "dd/MM")}.`
                        : `Không có đơn hàng nào ở trạng thái này.`}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {filteredOrders?.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => handleOrderClick(order)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Order Detail Sheet */}
        <OrderDetailSheet
          order={selectedOrder}
          open={sheetOpen}
          onOpenChange={handleSheetClose}
        />
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
        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all select-none border-b-2",
        isActive
          ? "text-foreground border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
      )}
    >
      {label}
      {count > 0 && (
        <span
          className={cn(
            "ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
            isActive
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-500";
    case "Confirmed":
      return "bg-indigo-500";
    case "Processing":
      return "bg-orange-500";
    case "Completed":
      return "bg-emerald-500";
    case "Cancelled":
      return "bg-destructive";
    default:
      return "bg-primary";
  }
}
