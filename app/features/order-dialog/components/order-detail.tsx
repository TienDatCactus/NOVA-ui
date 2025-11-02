import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState, useCallback, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import { OrderSchema } from "~/services/schema/order.schema";
import OrderItemWrapper from "../fragments/order-item-wrapper";

const { ServiceOrderSchema } = OrderSchema;
type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

interface OrderDetailProps {
  form: UseFormReturn<ServiceOrderDto>;
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
  bookingId?: string;
  customerName?: string;
  tableName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

/**
 * Restaurant-style order summary component
 * Displays customer details, order items, and price calculations
 * Each item fetches its own details using useServiceDetail/useMenuItemDetail
 */
export default function OrderDetail({
  form,
  onRemoveItem,
  onClearAll,
  bookingId,
  customerName,
  tableName,
  checkinDate,
  checkoutDate,
}: OrderDetailProps) {
  const selectedItems = form.watch("services") || [];

  const [itemPrices, setItemPrices] = useState<
    Record<string, { unitPrice: number; quantity: number }>
  >({});

  const handlePriceCalculated = useCallback(
    (itemId: string, unitPrice: number, quantity: number) => {
      setItemPrices((prev) => ({
        ...prev,
        [itemId]: { unitPrice, quantity },
      }));
    },
    []
  );

  // Calculate totals from tracked prices
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = Object.values(itemPrices).reduce(
      (sum, { unitPrice, quantity }) => sum + unitPrice * quantity,
      0
    );
    const tax = 0; // Can add: subtotal * 0.1 if needed
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [itemPrices]);

  return (
    <div className="h-full flex flex-col gap-3 p-0">
      <Card className="border shadow-sm">
        <CardHeader className=" ">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Thông tin đơn hàng</h3>
              {selectedItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearAll}>
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
                <span>Bàn/Phòng</span>
                <span className="text-right font-medium text-foreground">
                  {tableName || "---"}
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

      <Card className="flex-1  border shadow-sm flex flex-col  p-0">
        <CardContent className="flex-1 overflow-y-auto">
          {selectedItems.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              <p>Chưa có món nào</p>
              <p className="text-xs mt-1">Vui lòng chọn dịch vụ hoặc món ăn</p>
            </div>
          ) : (
            <div className="space-y-0">
              {selectedItems.map((item, idx) => (
                <OrderItemWrapper
                  key={item.itemId}
                  itemType={item.itemType}
                  itemId={item.itemId}
                  quantity={item.quantity}
                  note={item.note || ""}
                  scheduledDate={item.scheduledDate}
                  onQuantityChange={(qty) =>
                    form.setValue(`services.${idx}.quantity`, qty)
                  }
                  onNoteChange={(note) =>
                    form.setValue(`services.${idx}.note`, note)
                  }
                  onScheduledDateChange={(date) =>
                    form.setValue(`services.${idx}.scheduledDate`, date)
                  }
                  onRemove={() => onRemoveItem(idx)}
                  onPriceCalculated={handlePriceCalculated}
                />
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
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="tabular-nums">
                  {formatMoney(subtotal).vndFormatted}
                </span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Thuế VAT:</span>
                  <span className="tabular-nums">
                    {formatMoney(tax).vndFormatted}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary tabular-nums">
                {formatMoney(total).vndFormatted}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
