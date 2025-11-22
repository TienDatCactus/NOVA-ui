import { QueryClient, useMutation } from "@tanstack/react-query";
import { HolidayService } from "~/services/api/holiday";
import type {
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from "~/services/api/holiday/dto";

export function useCreateHoliday() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["create-holiday"],
    mutationFn: async (data: CreateHolidayRequest) => {
      await HolidayService.createHoliday(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["delete-holiday"],
    mutationFn: async (holidayId: string) => {
      await HolidayService.deleteHoliday(holidayId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useUpdateHoliday() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["update-holiday"],
    mutationFn: async (data: {
      holidayId: string;
      payload: UpdateHolidayRequest;
    }) => {
      await HolidayService.updateHoliday(data.holidayId, data.payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}
