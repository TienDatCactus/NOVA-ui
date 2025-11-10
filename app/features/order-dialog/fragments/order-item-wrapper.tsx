import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { useServiceOrderStore } from "~/store/service-order.store";
import OrderItemCard from "./order-item.card";

interface OrderItemWrapperProps {
  itemId: string;
}

/**
 * Wrapper component that fetches item details from global store and API
 * Connects OrderItemCard to the global service-order store
 */
export default function OrderItemWrapper({ itemId }: OrderItemWrapperProps) {
  // Get item from global store
  const item = useServiceOrderStore((s) =>
    s.services.find((service) => service.itemId === itemId)
  );
  if (!item) {
    return null;
  }
  // Fetch details based on item type
  const { data: serviceDetail, isLoading: isLoadingService } = useServiceDetail(
    itemId,
    {
      enabled: item?.itemType === "ServiceItem",
    }
  );

  const { data: menuDetail, isLoading: isLoadingMenu } = useMenuItemDetail(
    itemId,
    {
      enabled: item?.itemType === "MenuItem",
    }
  );
  console.log(menuDetail);
  const isLoading = isLoadingService || isLoadingMenu;

  let itemName = "";
  let unitPrice = 0;

  if (item.itemType === "ServiceItem" && serviceDetail) {
    itemName = serviceDetail.name;
    unitPrice = serviceDetail.basePrice;
  } else if (item.itemType === "MenuItem" && menuDetail) {
    itemName = menuDetail.name;
    unitPrice = menuDetail.price;
  }

  if (isLoading) {
    return (
      <div className="py-4 border-b last:border-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  return (
    <OrderItemCard itemId={itemId} itemName={itemName} unitPrice={unitPrice} />
  );
}
