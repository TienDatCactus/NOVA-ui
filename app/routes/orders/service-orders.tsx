import { HandPlatter, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import ServiceOrderCard from "./components/service-order-list/service-order-card";
import StatusFilter from "./components/service-order-list/status-filter";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";
import type { Route } from "./+types/service-orders";
import { useServiceOrderList } from "./container/service-order/query.hooks";
import { DatePicker } from "~/components/ui/date-picker";
import { format } from "date-fns";
import STORAGE, { getStorage } from "~/lib/storage";

type ServiceOrderStatus = ServiceOrderDetailDto["status"] | "All";

export default function Component({}: Route.ComponentProps) {
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;
  const { data: orders, isPending } = useServiceOrderList(formattedDate);
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "All") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-background border-b">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Danh sách đơn dịch vụ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các dịch vụ đã đặt
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
            ) : filteredOrders.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <HandPlatter />
                  </EmptyMedia>
                  <EmptyTitle>Không có đơn dịch vụ</EmptyTitle>
                  <EmptyDescription>
                    {statusFilter === "All"
                      ? "Chưa có đơn dịch vụ nào được tạo"
                      : `Không có đơn dịch vụ ${
                          statusFilter === "Scheduled"
                            ? "đã lên lịch"
                            : statusFilter === "Completed"
                              ? "hoàn thành"
                              : statusFilter === "Cancelled"
                                ? "đã hủy"
                                : "không đến"
                        }`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              filteredOrders.map((order: any) => (
                <ServiceOrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
