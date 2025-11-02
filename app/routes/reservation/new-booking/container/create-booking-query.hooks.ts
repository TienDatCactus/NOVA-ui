import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["preview-booking-price", data],
    queryFn: async () => {
      const idempotencyKey = crypto.randomUUID();
      return await BookingService.staffBookingPricePreview(
        idempotencyKey,
        data
      );
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for real-time pricing
    enabled: !!(data.checkinDate && data.checkoutDate),
  });
}
