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

export type WalkInCustomer = {
  name: string;
  phone?: string;
};

type PosOrderState = {
  // Order metadata
  orderId: string | null;
  bookingId: string | null;
  bookingRoomId: string | null;
  walkInCustomer: WalkInCustomer | null;

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
  setWalkInCustomer: (customer: WalkInCustomer | null) => void;
  clearOrder: () => void;

  // Actions - Cart management
  addItem: (
    item: Omit<PosCartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  recalculateSubtotal: () => void;
};

export const usePosOrderStore = create<PosOrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderId: null,
      bookingId: null,
      bookingRoomId: null,
      walkInCustomer: null,
      items: [],
      subtotal: 0,
      itemCount: 0,

      // Generate unique order ID (format: #POS + timestamp)
      generateOrderId: () => {
        const orderId = `#POS${Date.now()}`;
        set({ orderId });
      },

      setBookingInfo: (bookingId, bookingRoomId) => {
        set({ bookingId, bookingRoomId, walkInCustomer: null }); // Clear walk-in if booking selected
      },

      setWalkInCustomer: (customer) => {
        set({
          walkInCustomer: customer,
          bookingId: null,
          bookingRoomId: null,
        }); // Clear booking if walk-in
      },

      clearOrder: () => {
        set({
          orderId: null,
          bookingId: null,
          bookingRoomId: null,
          walkInCustomer: null,
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

      updateNotes: (menuItemId, notes) => {
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        });
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
