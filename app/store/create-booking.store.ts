import { z } from "zod";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useBookingSchema from "~/schema/booking.schema";

const { BookingSchema } = useBookingSchema();

type BookingFormData = z.infer<typeof BookingSchema>;

interface CreateBookingState {
  currentStep: number;
  formData: BookingFormData;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  formData: {
    customerInfo: {
      fullName: "",
      phoneNumber: "",
      adults: 1,
      children: 0,
      bookingChannel: "",
      checkIn: new Date(),
      checkOut: new Date(),
      bookingCode: "",
      email: "",
    },
    roomSelection: { rooms: [], selectedBreakfastDates: [] },

    services: [],
  },
};

const TOTAL_STEPS = 3;

export const useCreateBookingStore = create<CreateBookingState>()(
  persist(
    (set) => ({
      ...initialState,

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      updateServices: (services: z.infer<typeof BookingSchema>["services"]) =>
        set((state) => ({
          formData: { ...state.formData, services },
        })),
      reset: () => set(initialState),
    }),
    {
      name: "create-booking-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
