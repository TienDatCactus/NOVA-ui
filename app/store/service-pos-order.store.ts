import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ServicePosCartItem = {
  id: string; // Unique identifier for cart tracking
  serviceItemId?: string; // Optional for custom services
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  note?: string; // Item-level note
  // For custom services
  customServiceName?: string;
  customServiceDescription?: string;
};

type ServicePosOrderState = {
  // Order metadata
  bookingId: string | null;
  bookingRoomId: string | null;
  scheduledAt: string | null; // Time when service is scheduled

  // Single selected service (replaces items array)
  selectedService: ServicePosCartItem | null;

  // Computed values
  subtotal: number;

  // Actions - Order management
  setBookingInfo: (
    bookingId: string | null,
    bookingRoomId: string | null
  ) => void;
  setScheduledAt: (scheduledAt: string) => void;

  // Actions - Single service management
  selectService: (
    item: Omit<ServicePosCartItem, "quantity" | "note"> & {
      quantity?: number;
      note?: string;
    }
  ) => void;
  clearService: () => void;
  updateServiceQuantity: (quantity: number) => void;
  updateServiceNote: (note: string) => void;
  recalculateSubtotal: () => void;
};

export const useServicePosOrderStore = create<ServicePosOrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      bookingId: null,
      bookingRoomId: null,
      scheduledAt: null,
      selectedService: null,
      subtotal: 0,

      setBookingInfo: (bookingId, bookingRoomId) => {
        set({ bookingId, bookingRoomId });
      },

      setScheduledAt: (scheduledAt) => {
        set({ scheduledAt });
      },

      selectService: (item) => {
        // Replace current selection (silent replacement)
        const newService: ServicePosCartItem = {
          ...item,
          quantity: item.quantity || 1,
          note: item.note || "",
        };
        set({ selectedService: newService });
        get().recalculateSubtotal();
      },

      clearService: () => {
        set({ selectedService: null, subtotal: 0 });
      },

      updateServiceQuantity: (quantity) => {
        const service = get().selectedService;
        if (!service) return;

        if (quantity <= 0) {
          get().clearService();
          return;
        }

        set({
          selectedService: { ...service, quantity },
        });
        get().recalculateSubtotal();
      },

      updateServiceNote: (note) => {
        const service = get().selectedService;
        if (!service) return;

        set({
          selectedService: { ...service, note },
        });
      },

      recalculateSubtotal: () => {
        const service = get().selectedService;
        if (!service) {
          set({ subtotal: 0 });
          return;
        }
        const subtotal = service.unitPrice * service.quantity;
        set({ subtotal });
      },
    }),
    {
      name: "service-pos-order-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
