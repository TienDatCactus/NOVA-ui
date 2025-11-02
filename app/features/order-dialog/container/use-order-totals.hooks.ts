import { useMemo } from "react";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import type z from "zod";
import { OrderSchema } from "~/services/api/order/order.schema";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

/**
 * Hook to calculate order totals by fetching item details
 * Returns subtotal, tax, and total
 */
export function useOrderTotals(items: ServiceOrderItemDto[]) {
  // Fetch all service details
  const serviceItems = items.filter((item) => item.itemType === "service");
  const menuItems = items.filter((item) => item.itemType === "menu");

  // Create queries for services
  const serviceQueries = serviceItems.map((item) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useServiceDetail(item.itemId, { enabled: true })
  );

  // Create queries for menu items
  const menuQueries = menuItems.map((item) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMenuItemDetail(item.itemId, { enabled: true })
  );

  // Calculate totals
  const { subtotal, tax, total, isLoading } = useMemo(() => {
    let subtotal = 0;
    let isLoading = false;

    // Add service prices
    serviceItems.forEach((item, idx) => {
      const query = serviceQueries[idx];
      if (query.isLoading) {
        isLoading = true;
        return;
      }
      if (query.data) {
        subtotal += query.data.basePrice * item.quantity;
      }
    });

    // Add menu prices
    menuItems.forEach((item, idx) => {
      const query = menuQueries[idx];
      if (query.isLoading) {
        isLoading = true;
        return;
      }
      if (query.data) {
        subtotal += query.data.price * item.quantity;
      }
    });

    const tax = 0; // Can add: subtotal * 0.1 if needed
    const total = subtotal + tax;

    return { subtotal, tax, total, isLoading };
  }, [serviceQueries, menuQueries, serviceItems, menuItems]);

  return { subtotal, tax, total, isLoading };
}
