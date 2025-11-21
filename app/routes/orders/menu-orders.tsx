import { Loader2, Package } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import OrderCard from "./components/menu-order-list/order-card";
import StatusFilter from "./components/menu-order-list/status-filter";
import type { OrderStatus } from "~/services/api/orders/order.types";
import type { Route } from "./+types/menu-orders";
import { usePOSOrderList } from "./container/pos-orders/query.hooks";
import { DatePicker } from "~/components/ui/date-picker";
import { format } from "date-fns";

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;
  const { data: orders, isPending } = usePOSOrderList(formattedDate);
  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders?.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-background border-b">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Danh sách đơn hàng</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các đơn hàng POS đang
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4 flex-wrap">
            <StatusFilter
              activeStatus={statusFilter}
              onStatusChange={setStatusFilter}
            />
            <div className="ml-auto">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Chọn ngày"
                className="w-[220px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {isPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders?.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Không có đơn hàng</EmptyTitle>
                  <EmptyDescription>
                    {statusFilter === "All"
                      ? "Chưa có đơn hàng nào được tạo"
                      : `Không có đơn hàng ${statusFilter === "Open" ? "đang mở" : statusFilter === "Completed" ? "hoàn thành" : "đã hủy"}`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              filteredOrders?.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
