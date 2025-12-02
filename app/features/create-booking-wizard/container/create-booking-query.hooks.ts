import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type { StaffBookingPricePreviewRequestDto } from "~/services/api/booking/dto";

export function useOTAInfo({ selection }: { selection: boolean }) {
  return useQuery({
    queryKey: ["ota-info"],
    queryFn: async () => await BookingService.getBookingOTA(),
    staleTime: 5 * 60 * 1000,
    enabled: selection,
  });
}

export function usePreviewBookingPrice(
  data: StaffBookingPricePreviewRequestDto
) {
  return useMutation({
    mutationFn: async () => {
      const idempotencyKey = crypto.randomUUID();
      return await BookingService.staffBookingPricePreview(
        idempotencyKey,
        data
      );
    },
    onSuccess: () => {
      toast.success("Tính toán giá dự kiến thành công.");
    },
    onError: (error) => {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data?.message ||
              "Đã có lỗi xảy ra khi tính toán giá dự kiến."
          : "Đã có lỗi xảy ra khi tính toán giá dự kiến."
      );
    },
  });
}
