import { usePosOrderStore } from "~/store/pos-order.store";
import type { PosCartItem } from "~/store/pos-order.store";

export function usePosCart() {
  const {
    items,
    subtotal,
    itemCount,
    orderId,
    bookingId,
    bookingRoomId,
    walkInCustomer,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    setBookingInfo,
    setWalkInCustomer,
    generateOrderId,
    clearOrder,
  } = usePosOrderStore();

  const isEmpty = items.length === 0;

  const hasCustomerInfo = !!(bookingId || walkInCustomer);

  const customerDisplay = walkInCustomer
    ? walkInCustomer.name
    : bookingId
      ? `Booking #${bookingId}`
      : null;

  return {
    // State
    items,
    subtotal,
    itemCount,
    isEmpty,
    orderId,
    hasCustomerInfo,
    customerDisplay,
    bookingId,
    bookingRoomId,
    walkInCustomer,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    setBookingInfo,
    setWalkInCustomer,
    generateOrderId,
    clearOrder,
  };
}
