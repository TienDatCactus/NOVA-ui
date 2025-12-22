import type z from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { StaffCreateBookingSchema } = BookingSchema;
type CreateBookingInput = z.infer<typeof StaffCreateBookingSchema>;

// Extended type to include bookingType for UI flow
export type CreateBookingData = Partial<CreateBookingInput> & {
  bookingType?: "Direct" | "OTA" | "RoomBlock";
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
      setData: (data) => {
        const currentData = get().data;
        const newData = { ...currentData, ...data };

        // Auto-configure based on bookingType
        if (data.bookingType === "RoomBlock") {
          newData.source = "RoomBlock";
          newData.overridePrice = 0;
          newData.serviceOrder = undefined;
          newData.roomPayment = undefined;
          newData.includeBreakfast = false;
        } else if (data.bookingType === "Direct") {
          newData.source = "DirectStaff";
        } else if (data.bookingType === "OTA") {
          newData.source = "OTA";
        }

        set({ data: newData });
      },
      setStep: (step: number) => set({ currentStep: step }),
      reset: () => set({ data: {}, currentStep: 1 }),
    }),
    {
      name: "nova-create-booking",
      partialize: (state) => ({
        data: {
          ...state.data,
          serviceOrder: undefined,
        },
        currentStep: state.currentStep,
      }),
    }
  )
);
