import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PosCartItem = {
  menuItemId: string;
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
};

type PosOrderState = {
  // Order metadata
  orderId: string | null;
  bookingId: string | null;
  bookingRoomId: string | null;
  servedAt: string | null; // Time when customer wants order served

  // Cart items
  items: PosCartItem[];

  // Computed values
  subtotal: number;
  itemCount: number;

  // Actions - Order management
  generateOrderId: () => void;
  setBookingInfo: (
    bookingId: string | null,
    bookingRoomId: string | null
  ) => void;
  setServedAt: (servedAt: string) => void;
  clearOrder: () => void;

  // Actions - Cart management
  addItem: (
    item: Omit<PosCartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  recalculateSubtotal: () => void;
};

export const usePosOrderStore = create<PosOrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderId: null,
      bookingId: null,
      bookingRoomId: null,
      servedAt: null,
      items: [],
      subtotal: 0,
      itemCount: 0,

      // Generate unique order ID (format: #POS + timestamp)
      generateOrderId: () => {
        const orderId = `#POS${Date.now()}`;
        set({ orderId });
      },

      setBookingInfo: (bookingId, bookingRoomId) => {
        set({ bookingId, bookingRoomId }); // Clear walk-in if booking selected
      },

      setServedAt: (servedAt) => {
        set({ servedAt });
      },

      clearOrder: () => {
        set({
          orderId: null,
          bookingId: null,
          bookingRoomId: null,
          servedAt: null,
          items: [],
          subtotal: 0,
          itemCount: 0,
        });
      },

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find(
          (i) => i.menuItemId === item.menuItemId
        );

        if (existingItem) {
          // Increment quantity if item already in cart
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          // Add new item to cart
          set({
            items: [
              ...items,
              {
                ...item,
                quantity: item.quantity || 1,
              },
            ],
          });
        }
        get().recalculateSubtotal();
      },

      removeItem: (menuItemId) => {
        set({
          items: get().items.filter((i) => i.menuItemId !== menuItemId),
        });
        get().recalculateSubtotal();
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
        get().recalculateSubtotal();
      },

      recalculateSubtotal: () => {
        const items = get().items;
        const subtotal = items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ subtotal, itemCount });
      },
    }),
    {
      name: "pos-order-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
