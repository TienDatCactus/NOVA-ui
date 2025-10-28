import type z from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import useBookingSchema from "~/services/schema/booking.schema";

const { StaffCreateBookingSchema } = useBookingSchema();
type CreateBookingInput = z.infer<typeof StaffCreateBookingSchema>;

export type SelectedRoomData = {
  roomId: string;
  roomName: string;
  roomTypeName: string;
  baseRatePerNight: number;
};

// -------------
interface CreateBookingState {
  data: Partial<CreateBookingInput>;
  selectedRooms: SelectedRoomData[];
  currentStep: number;
  setData: (data: Partial<CreateBookingInput>) => void;
  setSelectedRooms: (rooms: SelectedRoomData[]) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useCreateBookingStore = create<CreateBookingState>()(
  persist(
    (set, get) => ({
      data: {},
      selectedRooms: [],
      currentStep: 1,
      setData: (data) =>
        set({
          data: { ...get().data, ...data },
        }),
      setSelectedRooms: (rooms) => set({ selectedRooms: rooms }),
      setStep: (step: number) => set({ currentStep: step }),
      reset: () => set({ data: {}, selectedRooms: [], currentStep: 1 }),
    }),
    {
      name: "nova-create-booking",
      partialize: (state) => ({
        data: state.data,
        currentStep: state.currentStep,
      }),
    }
  )
);
