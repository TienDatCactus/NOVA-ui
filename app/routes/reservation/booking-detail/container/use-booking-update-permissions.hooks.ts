import { useMemo } from "react";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import {
  canPerformHeavyUpdate,
  canPerformSoftUpdate,
  hasAnyLockedRoomInvoice,
  getHeavyUpdateBlockReason,
  getDateChangeBlockReason,
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
        dateChangeBlockReason: "Đang tải thông tin booking...",
        hasLockedInvoices: false,
      };
    }

    const invoices = bookingDetail.invoices || [];
    const status = bookingDetail.status;

    const canHeavyUpdate = canPerformHeavyUpdate(status, invoices);
    const hasLockedInvoices = hasAnyLockedRoomInvoice(invoices);
    const blockReason = getHeavyUpdateBlockReason(status, invoices);
    const dateChangeBlockReason = getDateChangeBlockReason(status, invoices);

    return {
      // Permissions
      canDoHeavyUpdate: canHeavyUpdate,
      canDoSoftUpdate: canPerformSoftUpdate(status),
      canEditDates: canChangeDates(status, invoices),
      canAddRooms: canAddRooms(status, invoices),
      canRemoveRooms: canRemoveRooms(status, invoices),

      // Metadata
      blockReason,
      dateChangeBlockReason,
      hasLockedInvoices,
    };
  }, [bookingDetail]);
}
