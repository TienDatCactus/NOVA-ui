import { useMemo } from "react";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import {
  calculateBookingFinancialStatus,
  canCheckoutBooking,
  type BookingFinancialSummary,
  type CheckoutEligibility,
} from "./booking-financial-calculator";

/**
 * Hook to calculate booking financial status from invoices
 * Pure frontend calculation - no backend API calls needed
 */
export function useBookingFinancialStatus(
  invoices: InvoiceListItemDto[] | undefined
): BookingFinancialSummary {
  return useMemo(() => {
    return calculateBookingFinancialStatus(invoices);
  }, [invoices]);
}

/**
 * Hook to check checkout eligibility
 * Validates both booking status and financial status
 */
export function useCheckoutEligibility(
  bookingDetail: BookingDetailResponseDto | undefined,
  pendingCharges?: {
    pendingOrders?: {
      posOrders?: any[];
      serviceOrders?: any[];
    };
  }
): CheckoutEligibility {
  return useMemo(() => {
    if (!bookingDetail) {
      return {
        canProceed: false,
        blockingReasons: ["Không tìm thấy thông tin booking"],
        warnings: [],
      };
    }

    return canCheckoutBooking(
      bookingDetail.status || "",
      bookingDetail.invoices,
      pendingCharges?.pendingOrders
    );
  }, [bookingDetail, pendingCharges]);
}
