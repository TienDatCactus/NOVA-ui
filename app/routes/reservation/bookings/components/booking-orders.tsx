import { Plus, Receipt, ShoppingCart, Utensils, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import type { POSOrderDetailDto } from "~/services/api/orders/dto";

interface BookingOrdersProps {
  hasOrder: boolean;
  isCreatingOrder: boolean;
  orderDetail?: POSOrderDetailDto;
  isLoadingOrder: boolean;
  onOpenCreateDialog: () => void;
  onAddMenuItem: () => void;
  onRemoveItem: (itemId: string) => void;
}

// Fake service data for now
const FAKE_SERVICES = [
  {
    id: "svc-1",
    name: "Massage trị liệu",
    quantity: 1,
    unitPrice: 500000,
    scheduledDate: "2025-11-06",
    note: "Yêu cầu kỹ thuật viên nữ",
  },
  {
    id: "svc-2",
    name: "Giặt ủi",
    quantity: 3,
    unitPrice: 50000,
    scheduledDate: "2025-11-06",
  },
];

export default function BookingOrders({
  hasOrder,
  isCreatingOrder,
  orderDetail,
  isLoadingOrder,
  onOpenCreateDialog,
  onAddMenuItem,
  onRemoveItem,
}: BookingOrdersProps) {
  // If no order exists, show create button
  if (!hasOrder) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Đơn POS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có đơn hàng POS nào cho booking này
            </p>
            <Button
              type="button"
              onClick={onOpenCreateDialog}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const menuItemsTotal =
    orderDetail?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  const servicesTotal = FAKE_SERVICES.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const grandTotal = menuItemsTotal + servicesTotal;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Đơn hàng POS
            {orderDetail && (
              <Badge variant="secondary" className="ml-2">
                {orderDetail.status}
              </Badge>
            )}
          </CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Tổng: </span>
            <span className="font-semibold">
              {formatMoney(grandTotal).vndFormatted}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Menu Items (POS Order) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Thực đơn ({orderDetail?.items.length || 0})
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onAddMenuItem}
              >
                <Plus className="h-3 w-3 mr-1" />
                Thêm món
              </Button>
            </div>

            {isLoadingOrder ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : orderDetail && orderDetail.items.length > 0 ? (
              <div className="space-y-2">
                {orderDetail.items.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.itemName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            SL: {item.quantity}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatMoney(item.unitPrice).vndFormatted}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1">
                          {formatMoney(item.subtotal).vndFormatted}
                        </p>
                        {item.servedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Phục vụ: {item.servedAt}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-md">
                Chưa có món nào
              </div>
            )}

            {orderDetail && orderDetail.items.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Tổng thực đơn:</span>
                  <span>{formatMoney(menuItemsTotal).vndFormatted}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Service Items (Fake Data) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Dịch vụ ({FAKE_SERVICES.length})
              </h3>
              <Badge variant="outline" className="text-xs">
                Dữ liệu mẫu
              </Badge>
            </div>

            <div className="space-y-2">
              {FAKE_SERVICES.map((service) => (
                <Card key={service.id} className="p-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {service.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          SL: {service.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatMoney(service.unitPrice).vndFormatted}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {service.scheduledDate}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        {
                          formatMoney(service.quantity * service.unitPrice)
                            .vndFormatted
                        }
                      </p>
                      {service.note && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {service.note}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm font-semibold">
                <span>Tổng dịch vụ:</span>
                <span>{formatMoney(servicesTotal).vndFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Tổng cộng:</span>
          <span className="text-lg font-bold text-primary">
            {formatMoney(grandTotal).vndFormatted}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
