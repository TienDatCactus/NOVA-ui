import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { formatMoney } from "~/lib/utils";
import OrderItemWrapper from "../fragments/order-item-wrapper";
import { useServiceOrderStore } from "~/store/service-order.store";

interface OrderDetailProps {
  onClearAll: () => void;
  bookingId?: string;
  customerName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function OrderDetail({
  onClearAll,
  bookingId,
  customerName,
}: OrderDetailProps) {
  const selectedItems = useServiceOrderStore((s) => s.services);
  const itemCount = selectedItems.length;

  return (
    <div className="flex flex-col gap-4 p-2  h-100 overflow-y-auto">
      <Card className="border py-4 shadow-sm">
        <CardHeader className="">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Thông tin đơn hàng</h3>
              {selectedItems.length > 0 && (
                <Button variant="destructive" size="sm" onClick={onClearAll}>
                  Xóa tất cả
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Khách hàng</span>
                <span className="text-right font-medium text-foreground">
                  {customerName || "---"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Mã đơn</span>
                <span className="text-right font-mono text-foreground tabular-nums">
                  #{bookingId || "---"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Ngày</span>
                <span className="text-right text-foreground tabular-nums">
                  {format(new Date(), "dd/MM/yyyy", { locale: vi })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border shadow-sm flex flex-col  p-0">
        <CardContent className="p-2">
          {selectedItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              <p>Chưa có món nào</p>
              <p className="text-xs mt-1">Vui lòng chọn dịch vụ hoặc món ăn</p>
            </div>
          ) : (
            <div className="space-y-2 ">
              {selectedItems.map((item) => (
                <OrderItemWrapper key={item.itemId} itemId={item.itemId} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary Card */}
      {selectedItems.length > 0 && (
        <Card className="border shadow-sm bg-muted/40  p-0">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số lượng món:</span>
                <span className="tabular-nums font-medium">{itemCount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium text-muted-foreground text-sm">
                Tổng cộng sẽ được tính khi xác nhận
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
