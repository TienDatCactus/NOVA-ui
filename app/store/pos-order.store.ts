import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PosCartItem = {
  id: string; // Unique identifier for cart tracking
  menuItemId?: string; // Optional for custom items
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
  // For custom items
  customItemName?: string;
  customItemDescription?: string;
};

type PosOrderState = {
  // Order metadata
  orderId: string | null;
  bookingId: string | null;
  bookingRoomId: string | null;
  servedAt: string | null; // Time when customer wants order served
  notes: string | null; // Optional notes for the whole order

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
  setNotes: (notes: string) => void;
  clearOrder: () => void;

  // Actions - Cart management
  addItem: (
    item: Omit<PosCartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
      notes: null,
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

      setNotes: (notes) => {
        set({ notes });
      },

      clearOrder: () => {
        set({
          orderId: null,
          bookingId: null,
          bookingRoomId: null,
          servedAt: null,
          notes: null,
          items: [],
          subtotal: 0,
          itemCount: 0,
        });
      },

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          // Increment quantity if item already in cart
          set({
            items: items.map((i) =>
              i.id === item.id
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

      removeItem: (id) => {
        set({
          items: get().items.filter((i) => i.id !== id),
        });
        get().recalculateSubtotal();
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
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
