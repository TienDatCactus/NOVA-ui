import { useEffect } from "react";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import OrderItemCard from "./order-item.card";

interface OrderItemWrapperProps {
  itemType: string;
  itemId: string;
  quantity: number;
  note: string;
  scheduledDate: string;
  onQuantityChange: (newQuantity: number) => void;
  onNoteChange: (note: string) => void;
  onScheduledDateChange: (date: string) => void;
  onRemove: () => void;
  onPriceCalculated?: (
    itemId: string,
    unitPrice: number,
    quantity: number
  ) => void;
}

/**
 * Wrapper component that fetches item details and renders OrderItemCard
 * Uses useServiceDetail or useMenuItemDetail based on itemType
 */
export default function OrderItemWrapper({
  itemType,
  itemId,
  quantity,
  note,
  scheduledDate,
  onQuantityChange,
  onNoteChange,
  onScheduledDateChange,
  onRemove,
  onPriceCalculated,
}: OrderItemWrapperProps) {
  const {
    data: serviceDetail,
    isLoading: isLoadingService,
    isError: isServiceError,
  } = useServiceDetail(itemId, {
    enabled: itemType === "ServiceItem",
  });

  const {
    data: menuDetail,
    isLoading: isLoadingMenu,
    isError: isMenuError,
  } = useMenuItemDetail(itemId, {
    enabled: itemType === "MenuItem",
  });

  const isLoading = isLoadingService || isLoadingMenu;
  const isError = isServiceError || isMenuError;

  let itemName = "";
  let unitPrice = 0;

  if (itemType === "ServiceItem" && serviceDetail) {
    itemName = serviceDetail.name;
    unitPrice = serviceDetail.basePrice;
  } else if (itemType === "MenuItem" && menuDetail) {
    itemName = menuDetail.name;
    unitPrice = menuDetail.price;
  }

  useEffect(() => {
    if (!isLoading && !isError && unitPrice > 0) {
      onPriceCalculated?.(itemId, unitPrice, quantity);
    }
  }, [itemId, unitPrice, quantity, isLoading, isError, onPriceCalculated]);

  if (isLoading) {
    return (
      <div className="py-4 border-b last:border-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="py-4 border-b last:border-0">
        <p className="text-sm text-destructive">
          Không thể tải thông tin món: {itemId}
        </p>
      </div>
    );
  }

  return (
    <OrderItemCard
      itemName={itemName || itemId}
      unitPrice={unitPrice}
      quantity={quantity}
      note={note || null}
      scheduledDate={scheduledDate}
      onQuantityChange={onQuantityChange}
      onNoteChange={onNoteChange}
      onScheduledDateChange={onScheduledDateChange}
      onRemove={onRemove}
    />
  );
}
