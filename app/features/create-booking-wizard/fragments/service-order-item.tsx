import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceOrderItemProps {
  service: ServiceOrderItemDto;
  onRemove: () => void;
}

/**
 * Individual service order item that fetches its own details
 * Handles both service and menu items
 */
export function ServiceOrderItem({ service, onRemove }: ServiceOrderItemProps) {
  const { data: serviceDetail, isLoading: isLoadingService } = useServiceDetail(
    service.itemId,
    {
      enabled: service.itemType === "ServiceItem",
    }
  );

  const { data: menuDetail, isLoading: isLoadingMenu } = useMenuItemDetail(
    service.itemId,
    {
      enabled: service.itemType === "MenuItem",
    }
  );
  const isLoading = isLoadingService || isLoadingMenu;

  let itemName = service.itemId; // fallback to itemId
  if (service.itemType === "ServiceItem" && serviceDetail) {
    itemName = serviceDetail.name;
  } else if (service.itemType === "MenuItem" && menuDetail) {
    itemName = menuDetail.name;
  }
  if (isLoading) {
    return (
      <div className="flex items-start justify-between p-3 rounded-md border bg-muted/30">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between p-3 rounded-md border bg-muted/30">
      <div className="flex-1 space-y-1">
        <p className="font-medium text-sm">{itemName}</p>
        <p className="text-xs text-muted-foreground">
          Số lượng: {service.quantity}
        </p>
        <p className="text-xs text-muted-foreground">
          Ngày thực hiện: {service.scheduledDate}
        </p>
        {service.note && (
          <p className="text-xs text-muted-foreground italic">
            Ghi chú: {service.note}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
        <span className="sr-only">Xóa dịch vụ</span>
      </Button>
    </div>
  );
}
