import { create } from "zustand";
import { persist } from "zustand/middleware";
import z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";

const { ServiceOrderSchema, ServiceOrderItemSchema } = OrderSchema;

export type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
export type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

type ServiceOrderState = {
  bookingId?: string | null;
  roomId?: string | null;
  services: ServiceOrderItemDto[];
  setContext: (ctx: {
    bookingId?: string | null;
    roomId?: string | null;
  }) => void;
  replaceAll: (items: ServiceOrderItemDto[]) => void;
  clear: () => void;
  addItem: (item: ServiceOrderItemDto) => void;
  addMany: (items: ServiceOrderItemDto[]) => void;
  removeById: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  setNote: (itemId: string, note: string) => void;
  setScheduledDate: (itemId: string, date: string) => void;
};

export const useServiceOrderStore = create<ServiceOrderState>()(
  persist(
    (set, get) => ({
      bookingId: null,
      roomId: null,
      services: [],
      setContext: ({ bookingId, roomId }) =>
        set({ bookingId: bookingId ?? null, roomId: roomId ?? null }),
      replaceAll: (items) => set({ services: items }),
      clear: () => set({ services: [] }),
      addItem: (item) => {
        const exists = get().services.some((s) => s.itemId === item.itemId);
        if (exists) return;
        set({ services: [...get().services, item] });
      },
      addMany: (items) => {
        const map = new Map(get().services.map((s) => [s.itemId, s] as const));
        for (const it of items) {
          if (!map.has(it.itemId)) map.set(it.itemId, it);
        }
        set({ services: Array.from(map.values()) });
      },
      removeById: (itemId) =>
        set({ services: get().services.filter((s) => s.itemId !== itemId) }),
      setQuantity: (itemId, quantity) =>
        set({
          services: get().services.map((s) =>
            s.itemId === itemId ? { ...s, quantity: Math.max(0, quantity) } : s
          ),
        }),
      setNote: (itemId, note) =>
        set({
          services: get().services.map((s) =>
            s.itemId === itemId ? { ...s, note } : s
          ),
        }),
      setScheduledDate: (itemId, date) =>
        set({
          services: get().services.map((s) =>
            s.itemId === itemId ? { ...s, scheduledDate: date } : s
          ),
        }),
    }),
    {
      name: "service-order-store",
      partialize: (state) => ({
        bookingId: state.bookingId,
        roomId: state.roomId,
        services: state.services,
      }),
    }
  )
);
