import { useMemo } from "react";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import {
  canPerformHeavyUpdate,
  canPerformSoftUpdate,
  getLockedRoomInvoices,
  getHeavyUpdateBlockReason,
  canChangeDates,
  canAddRooms,
  canRemoveRooms,
} from "./booking-validation";

/**
 * Hook to determine what update operations are allowed on a booking
 * based on its status and invoice states
 */
export function useBookingUpdatePermissions(
  bookingDetail: BookingDetailResponseDto | undefined
) {
  return useMemo(() => {
    if (!bookingDetail) {
      return {
        // Permissions
        canDoHeavyUpdate: false,
        canDoSoftUpdate: false,
        canEditDates: false,
        canAddRooms: false,
        canRemoveRooms: false,

        // Metadata
        blockReason: "Đang tải thông tin booking...",
        hasLockedInvoices: false,
        lockedInvoiceCount: 0,
      };
    }

    const invoices = bookingDetail.invoices || [];
    const status = bookingDetail.status;

    const canHeavyUpdate = canPerformHeavyUpdate(status, invoices);
    const lockedInvoices = getLockedRoomInvoices(invoices);
    const blockReason = getHeavyUpdateBlockReason(status, invoices);

    return {
      // Permissions
      canDoHeavyUpdate: canHeavyUpdate,
      canDoSoftUpdate: canPerformSoftUpdate(status),
      canEditDates: canChangeDates(status, invoices),
      canAddRooms: canAddRooms(status, invoices),
      canRemoveRooms: canRemoveRooms(status, invoices),

      // Metadata
      blockReason,
      hasLockedInvoices: lockedInvoices.length > 0,
      lockedInvoiceCount: lockedInvoices.length,
      lockedInvoices,
    };
  }, [bookingDetail]);
}
