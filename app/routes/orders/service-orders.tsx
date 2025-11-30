import { format } from "date-fns";
import { HandPlatter, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { ServiceOrderDetailDto } from "~/services/api/orders/dto";
import type { Route } from "./+types/service-orders";
import ServiceOrderCard from "./components/service-order-list/service-order-card";
import StatusFilter from "./components/service-order-list/status-filter";
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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === "All") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* --- HEADER SECTION --- */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-5 shadow-sm">
        {/* Container giới hạn max-width để UI gọn gàng trên màn hình lớn */}
        <div className="mx-auto w-full max-w-[1800px] space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Danh sách dịch vụ
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi và xử lý các yêu cầu dịch vụ từ khách hàng
              </p>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 overflow-x-auto pb-1 sm:pb-0">
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

      {/* --- ORDER LIST CONTENT --- */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto min-h-full w-full max-w-[1800px] p-4 md:p-6">
            {isPending ? (
              // Loading State: Căn giữa viewport
              <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              // Empty State: Căn giữa viewport
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <HandPlatter />
                  </EmptyMedia>
                  <EmptyTitle>Không tìm thấy đơn dịch vụ</EmptyTitle>
                  <EmptyDescription>
                    {statusFilter === "All"
                      ? "Chưa có yêu cầu dịch vụ nào cho ngày này."
                      : `Không có đơn dịch vụ nào đang ở trạng thái "${
                          statusFilter === "Scheduled"
                            ? "Đã lên lịch"
                            : statusFilter === "Completed"
                              ? "Hoàn thành"
                              : statusFilter === "Cancelled"
                                ? "Đã hủy"
                                : "Không đến"
                        }".`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              // --- MASONRY GRID LAYOUT ---
              // columns-1: Mobile
              // md:columns-2: Tablet
              // xl:columns-3: Desktop
              // 2xl:columns-4: Màn hình cực lớn
              <div className="columns-1 gap-4 space-y-4 md:columns-2 xl:columns-3 2xl:columns-4">
                {filteredOrders.map((order: any) => (
                  // break-inside-avoid: Quan trọng! Ngăn thẻ bị cắt đôi giữa 2 cột
                  <div key={order.id} className="break-inside-avoid pb-4">
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
