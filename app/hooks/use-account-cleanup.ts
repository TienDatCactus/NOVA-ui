import { useQueryClient } from "@tanstack/react-query";
import { useCheckoutStore } from "~/store/checkout.store";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useMenuPosOrderStore } from "~/store/menu-pos-order.store";

/**
 * Hook to clean up all feature stores and cached data before account switch.
 * This prevents data leakage between user sessions.
 */
export function useAccountCleanup() {
  const queryClient = useQueryClient();

  const cleanupAllStores = () => {
    // Clear all TanStack Query cache
    queryClient.clear();

    // Reset Create Booking Store
    const bookingStore = useCreateBookingStore.getState();
    if (bookingStore.reset) {
      bookingStore.reset();
    }

    // Reset Checkout Store
    const checkoutStore = useCheckoutStore.getState();
    if (checkoutStore.reset) {
      checkoutStore.reset();
    }

    // Reset Menu POS Order Store
    const menuPosStore = useMenuPosOrderStore.getState();
    if (menuPosStore.clearOrder) {
      menuPosStore.clearOrder();
    }

    console.log("[Account Cleanup] All feature stores and cache cleared");
  };

  return { cleanupAllStores };
}
