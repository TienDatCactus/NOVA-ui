import { useMemo } from "react";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import {
  canUpdateNonStructural,
  canUpdateDates,
  canUpdateGuestCount,
  canUpdateTotalAmount,
  getDateUpdateBlockReason,
  canAddRoom,
  canModifyExistingStructure,
  isBookingCompletelyLocked,
  hasAnyLockedRoomInvoice,
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
        // Granular permissions (new API)
        canUpdateNonStructural: false,
        canUpdateDates: false,
        canUpdateGuestCount: false,
        canUpdateTotalAmount: false,
        canAddRoom: false,
        canModifyRooms: false,

        // Legacy compatibility
        canDoHeavyUpdate: false,
        canDoSoftUpdate: false,
        canEditDates: false,
        canAddRooms: false,
        canRemoveRooms: false,

        // Metadata
        isCompletelyLocked: false,
        hasLockedInvoices: false,
        blockReason: "Đang tải thông tin booking...",
        dateChangeBlockReason: "Đang tải thông tin booking...",
      };
    }

    const invoices = bookingDetail.invoices || [];
    const status = bookingDetail.status;

    const hasLockedInvoices = hasAnyLockedRoomInvoice(invoices);
    const dateChangeBlockReason = getDateUpdateBlockReason(status, invoices);
    const canModifyStructure = canModifyExistingStructure(status, invoices);
    const canUpdateDatesFlag = canUpdateDates(status, invoices);

    return {
      // Granular permissions (new API)
      canUpdateNonStructural: canUpdateNonStructural(status),
      canUpdateDates: canUpdateDatesFlag,
      canUpdateGuestCount: canUpdateGuestCount(status, invoices),
      canUpdateTotalAmount: canUpdateTotalAmount(status),
      canAddRoom: canAddRoom(status, invoices),
      canModifyRooms: canModifyStructure,

      // Legacy compatibility (keep for backward compatibility)
      canDoHeavyUpdate: canModifyStructure,
      canDoSoftUpdate: canUpdateNonStructural(status),
      canEditDates: canUpdateDatesFlag,
      canAddRooms: canAddRoom(status, invoices),
      canRemoveRooms: canModifyStructure,

      // Metadata
      isCompletelyLocked: isBookingCompletelyLocked(status),
      hasLockedInvoices,
      dateChangeBlockReason,
      blockReason: canModifyStructure
        ? null
        : "Không thể thay đổi cấu trúc booking khi đã có thanh toán hoặc booking đã kết thúc",
    };
  }, [bookingDetail]);
}
