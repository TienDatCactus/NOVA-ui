import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MenuPosCartItem = {
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
  // Inventory control
  maxQuantityAvailable?: number; // Maximum quantity that can be ordered
};

type MenuPosOrderState = {
  // Order metadata
  orderId: string | null;
  bookingId: string | null;
  bookingRoomId: string | null;
  scheduledAt: string | null; // Time when customer wants order served
  notes: string | null; // Optional notes for the whole order

  // Cart items
  items: MenuPosCartItem[];

  // Computed values
  subtotal: number;
  itemCount: number;

  // Actions - Order management
  generateOrderId: () => void;
  setBookingInfo: (
    bookingId: string | null,
    bookingRoomId: string | null
  ) => void;
  setScheduledAt: (scheduledAt: string) => void;
  setNotes: (notes: string) => void;
  clearOrder: () => void;

  // Actions - Cart management
  addItem: (
    item: Omit<MenuPosCartItem, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  recalculateSubtotal: () => void;
};

export const useMenuPosOrderStore = create<MenuPosOrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      orderId: null,
      bookingId: null,
      bookingRoomId: null,
      scheduledAt: null,
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

      setScheduledAt: (scheduledAt) => {
        set({ scheduledAt });
      },

      setNotes: (notes) => {
        set({ notes });
      },

      clearOrder: () => {
        set({
          orderId: null,
          bookingId: null,
          bookingRoomId: null,
          scheduledAt: null,
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
          // Check if increment would exceed max available
          const newQuantity = existingItem.quantity + (item.quantity || 1);
          const maxAvailable = existingItem.maxQuantityAvailable;

          if (maxAvailable !== undefined && newQuantity > maxAvailable) {
            // Don't add, quantity would exceed max available
            console.warn(`Cannot add more: max available is ${maxAvailable}`);
            return;
          }

          // Increment quantity if item already in cart
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
          });
        } else {
          // Check max available for new item
          const requestedQuantity = item.quantity || 1;
          const maxAvailable = item.maxQuantityAvailable;

          if (maxAvailable !== undefined && requestedQuantity > maxAvailable) {
            console.warn(
              `Cannot add: requested ${requestedQuantity} but only ${maxAvailable} available`
            );
            return;
          }

          // Add new item to cart
          set({
            items: [
              ...items,
              {
                ...item,
                quantity: requestedQuantity,
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

        // Check max available before updating
        const item = get().items.find((i) => i.id === id);
        if (
          item?.maxQuantityAvailable !== undefined &&
          quantity > item.maxQuantityAvailable
        ) {
          console.warn(
            `Cannot update: max available is ${item.maxQuantityAvailable}`
          );
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
      name: "menu-pos-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
