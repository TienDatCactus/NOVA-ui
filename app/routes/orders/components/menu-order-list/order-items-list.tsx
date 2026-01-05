import { format } from "date-fns";
import { formatMoney } from "~/lib/utils";
import type { POSOrderItemDto } from "~/services/api/orders/dto";

interface OrderItemsListProps {
  items: POSOrderItemDto[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Không có món nào trong đơn hàng
      </div>
    );
  }

  return (
    <div>
      {!!items &&
        items.length > 0 &&
        items.map((item) => {
          const { vndFormatted: unitPrice } = formatMoney(item.unitPrice);
          const { vndFormatted: subtotal } = formatMoney(item.subtotal);

          return (
            <div
              key={item.id}
              className="flex items-start justify-between border-b gap-4 p-3 rounded-md bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.itemName}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Số lượng: {item.quantity}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {unitPrice} / món
                  </span>
                </div>
                {item.servedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Phục vụ lúc: {format(item.servedAt, "HH:mm dd/MM/yyyy")}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-semibold text-sm">{subtotal}</div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
