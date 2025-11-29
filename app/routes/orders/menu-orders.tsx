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
    <div className="flex h-full flex-col bg-muted/30">
      {/* --- HEADER SECTION --- */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-5 shadow-sm">
        {/* Container giới hạn max-width để không bị quá rộng trên màn hình Ultrawide */}
        <div className="mx-auto w-full max-w-[1800px] space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Danh sách đơn F&B
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Quản lý các đơn hàng POS đang xử lý tại quầy
              </p>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <StatusFilter
                activeStatus={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>
            <div className="w-full sm:w-[240px]">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Chọn ngày lọc"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- ORDER LIST SECTION --- */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto min-h-full w-full max-w-[1800px] p-4 md:p-6">
            {isPending ? (
              // Loading State: Căn giữa màn hình nhìn thấy (viewport)
              <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : filteredOrders?.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Không có đơn F&B</EmptyTitle>
                  <EmptyDescription>
                    {statusFilter === "All"
                      ? "Chưa có đơn hàng nào được tạo trong ngày này."
                      : `Không tìm thấy đơn hàng nào có trạng thái "${
                          statusFilter === "Open"
                            ? "Đang mở"
                            : statusFilter === "Completed"
                              ? "Hoàn thành"
                              : "Đã hủy"
                        }".`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3 ">
                {filteredOrders?.map((order) => (
                  <div key={order.id} className="break-inside-avoid pb-4">
                    <OrderCard order={order} />
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
