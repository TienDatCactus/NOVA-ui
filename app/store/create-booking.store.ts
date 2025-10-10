import type z from "zod";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useBookingSchema from "~/schema/booking.schema";
const { CustomerBookingInfoSchema } = useBookingSchema();

// 1. Định nghĩa cấu trúc của State và Actions
interface CreateBookingState {
  currentStep: number;
  formData: Partial<z.infer<typeof CustomerBookingInfoSchema>>; // Dùng Partial<> vì ban đầu formData rỗng
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (
    data: Partial<z.infer<typeof CustomerBookingInfoSchema>>
  ) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  formData: {},
};

export const useCreateBookingStore = create<CreateBookingState>()(
  persist(
    (set) => ({
      ...initialState,
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data }, // Gộp dữ liệu mới vào formData hiện tại
        })),
      reset: () => set(initialState),
    }),
    {
      name: "create-booking-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
