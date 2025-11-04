import type z from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { StaffCreateBookingSchema } = BookingSchema;
type CreateBookingInput = z.infer<typeof StaffCreateBookingSchema>;

// Extended type to include bookingType for UI flow
type CreateBookingData = Partial<CreateBookingInput> & {
  bookingType?: "Direct" | "OTA";
};

// -------------
interface CreateBookingState {
  data: CreateBookingData;
  currentStep: number;
  setData: (data: Partial<CreateBookingData>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useCreateBookingStore = create<CreateBookingState>()(
  persist(
    (set, get) => ({
      data: {},
      currentStep: 1,
      setData: (data) =>
        set({
          data: { ...get().data, ...data },
        }),
      setStep: (step: number) => set({ currentStep: step }),
      reset: () => set({ data: {}, currentStep: 1 }),
    }),
    {
      name: "nova-create-booking",
      partialize: (state) => ({
        data: {
          ...state.data,
          serviceOrder: undefined, // Exclude serviceOrder from persistence
        },
        currentStep: state.currentStep,
      }),
    }
  )
);
