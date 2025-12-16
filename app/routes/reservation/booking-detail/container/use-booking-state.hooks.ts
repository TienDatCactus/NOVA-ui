import { useMemo } from "react";
import type z from "zod";
import { formatMoney } from "~/lib/utils";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";

// ============================================
// TYPES
// ============================================
type BookingStatus = z.infer<typeof BookingSchema.BookingStatusEnum>;

export type BookingFinancialStatus =
  | "Unpaid"
  | "PartiallyPaid"
  | "Paid"
  | "Overpaid";

export interface BookingFinancialSummary {
  financialStatus: BookingFinancialStatus;
  totalInvoiced: number;
  totalPaid: number;
  totalBalance: number;
  unpaidInvoiceCount: number;
  paidInvoiceCount: number;
}

export interface BookingPermissions {
  canEdit: boolean;
  canEditDates: boolean;
  canEditRooms: boolean;
  canEditGuests: boolean;
  blockReason: string | null;
  dateChangeBlockReason: string | null;
}

export interface BookingState {
  permissions: BookingPermissions;
  financial: BookingFinancialSummary;
  isLoading: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const PRE_STAY_STATUSES: BookingStatus[] = ["Pending", "Confirmed"];
const ACTIVE_STAY_STATUSES: BookingStatus[] = ["CheckedIn", "InHouse"];
const LOCKED_STATUSES: BookingStatus[] = ["CheckedOut", "Cancelled"];

// ============================================
// VALIDATION HELPERS (Simplified)
// ============================================

function hasAnyInvoiceWithPayment(invoices: InvoiceListItemDto[]): boolean {
  return invoices.some(
    (inv) => inv.status !== "Voided" && (inv.paidAmount || 0) > 0
  );
}

function canEditBasicInfo(status: BookingStatus): boolean {
  return status !== "Cancelled";
}

function canEditDates(
  status: BookingStatus,
  invoices: InvoiceListItemDto[]
): boolean {
  if (LOCKED_STATUSES.includes(status)) return false;
  return !hasAnyInvoiceWithPayment(invoices);
}

function canEditRooms(
  status: BookingStatus,
  invoices: InvoiceListItemDto[]
): boolean {
  // Allow adding rooms for active stays
  if (ACTIVE_STAY_STATUSES.includes(status)) return true;
  // For pre-stay: allow even with payment
  if (PRE_STAY_STATUSES.includes(status)) return true;
  return false;
}

function canEditGuests(
  status: BookingStatus,
  invoices: InvoiceListItemDto[]
): boolean {
  if (!PRE_STAY_STATUSES.includes(status)) return false;
  return !hasAnyInvoiceWithPayment(invoices);
}

function getDateBlockReason(
  status: BookingStatus,
  invoices: InvoiceListItemDto[]
): string | null {
  if (LOCKED_STATUSES.includes(status)) {
    return "Không thể thay đổi ngày cho booking đã kết thúc";
  }
  if (hasAnyInvoiceWithPayment(invoices)) {
    return "Không thể thay đổi ngày khi đã có thanh toán";
  }
  return null;
}

function getGeneralBlockReason(
  status: BookingStatus,
  invoices: InvoiceListItemDto[]
): string | null {
  if (status === "Cancelled") {
    return "Booking đã bị hủy";
  }
  if (status === "CheckedOut") {
    return "Booking đã checkout";
  }
  if (
    hasAnyInvoiceWithPayment(invoices) &&
    !ACTIVE_STAY_STATUSES.includes(status)
  ) {
    return "Không thể thay đổi cấu trúc khi đã có thanh toán";
  }
  return null;
}

// ============================================
// FINANCIAL CALCULATOR (Simplified)
// ============================================

function calculateFinancialStatus(
  invoices: InvoiceListItemDto[] | undefined
): BookingFinancialSummary {
  const activeInvoices = (invoices || []).filter(
    (inv) => inv.status !== "Voided"
  );

  if (activeInvoices.length === 0) {
    return {
      financialStatus: "Unpaid",
      totalInvoiced: 0,
      totalPaid: 0,
      totalBalance: 0,
      unpaidInvoiceCount: 0,
      paidInvoiceCount: 0,
    };
  }

  const totalInvoiced = activeInvoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );
  const totalPaid = activeInvoices.reduce(
    (sum, inv) => sum + (inv.paidAmount || 0),
    0
  );
  const totalBalance = activeInvoices.reduce(
    (sum, inv) => sum + (inv.balance || 0),
    0
  );

  const unpaidInvoiceCount = activeInvoices.filter(
    (inv) => (inv.balance || 0) > 0
  ).length;
  const paidInvoiceCount = activeInvoices.filter(
    (inv) => inv.status === "Paid"
  ).length;

  let financialStatus: BookingFinancialStatus;
  if (totalBalance === 0 && totalInvoiced > 0) {
    financialStatus = "Paid";
  } else if (totalPaid === 0) {
    financialStatus = "Unpaid";
  } else if (totalPaid > totalInvoiced) {
    financialStatus = "Overpaid";
  } else {
    financialStatus = "PartiallyPaid";
  }

  return {
    financialStatus,
    totalInvoiced,
    totalPaid,
    totalBalance,
    unpaidInvoiceCount,
    paidInvoiceCount,
  };
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * Unified booking state hook
 * Consolidates permissions, validation, and financial calculations
 * Reduces 5 files (~600 lines) to 1 file (~180 lines)
 */
export function useBookingState(
  bookingDetail: BookingDetailResponseDto | undefined
): BookingState {
  return useMemo(() => {
    if (!bookingDetail) {
      return {
        permissions: {
          canEdit: false,
          canEditDates: false,
          canEditRooms: false,
          canEditGuests: false,
          blockReason: "Đang tải thông tin booking...",
          dateChangeBlockReason: "Đang tải thông tin booking...",
        },
        financial: {
          financialStatus: "Unpaid",
          totalInvoiced: 0,
          totalPaid: 0,
          totalBalance: 0,
          unpaidInvoiceCount: 0,
          paidInvoiceCount: 0,
        },
        isLoading: true,
      };
    }

    const invoices = bookingDetail.invoices || [];
    const status = bookingDetail.status as BookingStatus;

    const permissions: BookingPermissions = {
      canEdit: canEditBasicInfo(status),
      canEditDates: canEditDates(status, invoices),
      canEditRooms: canEditRooms(status, invoices),
      canEditGuests: canEditGuests(status, invoices),
      blockReason: getGeneralBlockReason(status, invoices),
      dateChangeBlockReason: getDateBlockReason(status, invoices),
    };

    const financial = calculateFinancialStatus(invoices);

    return {
      permissions,
      financial,
      isLoading: false,
    };
  }, [bookingDetail]);
}

// ============================================
// PAYMENT VALIDATION HELPERS (for invoice-detail-sheet)
// ============================================

export function canInvoiceAcceptPayment(status: string): {
  canProceed: boolean;
  reason?: string;
} {
  const allowedStatuses = ["Unpaid", "DepositOnly", "PartiallyPaid"];

  if (status === "Paid") {
    return { canProceed: false, reason: "Hóa đơn đã thanh toán đủ" };
  }

  if (status === "Voided") {
    return { canProceed: false, reason: "Hóa đơn đã bị hủy" };
  }

  if (allowedStatuses.includes(status)) {
    return { canProceed: true };
  }

  return {
    canProceed: false,
    reason: "Trạng thái hóa đơn không hợp lệ để thanh toán",
  };
}

export function validatePaymentAmount(
  paidAmount: number,
  balance: number,
  total: number,
  status: string
): { isValid: boolean; error?: string } {
  // Rule 1: Amount must be positive
  if (paidAmount <= 0) {
    return { isValid: false, error: "Số tiền phải lớn hơn 0" };
  }

  // Rule 2: For unpaid/partial invoices, cannot exceed balance
  const canAcceptPayment = canInvoiceAcceptPayment(status);
  if (canAcceptPayment && paidAmount > balance) {
    return {
      isValid: false,
      error: "Số tiền thanh toán không được vượt quá số tiền còn lại",
    };
  }

  // Rule 3: For paid invoices, no more payment allowed
  if (status === "Paid") {
    return {
      isValid: false,
      error: "Hóa đơn đã thanh toán đủ",
    };
  }

  // Rule 4: For voided invoices, no payment allowed
  if (status === "Voided") {
    return {
      isValid: false,
      error: "Không thể thanh toán hóa đơn đã hủy",
    };
  }

  return { isValid: true };
}

// ============================================
// UPGRADE ROOM VALIDATION (for booking-rooms-bar)
// ============================================

export function canUpgradeRoom(bookingStatus: string): boolean {
  return (
    bookingStatus === "Confirmed" ||
    bookingStatus === "CheckedIn" ||
    bookingStatus === "InHouse"
  );
}

// ============================================
// CHECKOUT ELIGIBILITY (for checkout-sheet)
// ============================================

export interface CheckoutEligibility {
  canProceed: boolean;
  blockingReasons: string[];
  warnings: string[];
}

export function canCheckoutBooking(
  bookingStatus: string,
  invoices: InvoiceListItemDto[] | undefined,
  pendingOrders?: {
    posOrders?: any[];
    serviceOrders?: any[];
  }
): CheckoutEligibility {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Booking must be InHouse or CheckedIn
  if (
    !["InHouse", "CheckedIn"].includes(bookingStatus) &&
    bookingStatus !== "CheckedOut"
  ) {
    reasons.push("Booking chưa ở trạng thái InHouse/CheckedIn");
  }

  // Rule 2: No pending orders
  const totalPendingOrders =
    (pendingOrders?.posOrders?.length || 0) +
    (pendingOrders?.serviceOrders?.length || 0);

  if (totalPendingOrders > 0) {
    reasons.push(
      `Còn ${totalPendingOrders} order chưa được tạo invoice. Vui lòng tạo checkout invoice trước.`
    );
  }

  // Rule 3: All invoices must be paid
  const activeInvoices = (invoices || []).filter(
    (inv) => inv.status !== "Voided"
  );

  const unpaidInvoices = activeInvoices.filter((inv) => (inv.balance || 0) > 0);

  if (unpaidInvoices.length > 0) {
    const totalUnpaid = unpaidInvoices.reduce(
      (sum, inv) => sum + (inv.balance || 0),
      0
    );
    reasons.push(
      `Còn ${unpaidInvoices.length} hóa đơn chưa thanh toán (tổng: ${formatMoney(totalUnpaid).vndFormatted})`
    );
  }

  // Rule 4: Check for overpaid invoices (warning only)
  const overpaidInvoices = activeInvoices.filter(
    (inv) => inv.status === "Overpaid"
  );

  if (overpaidInvoices.length > 0) {
    const totalOverpaid = overpaidInvoices.reduce(
      (sum, inv) => sum + Math.abs(inv.balance || 0),
      0
    );
    warnings.push(
      `Có ${overpaidInvoices.length} hóa đơn thanh toán thừa (${
        formatMoney(totalOverpaid).vndFormatted
      }). Khách hàng cần được hoàn trả trước khi checkout.`
    );
  }

  return {
    canProceed: reasons.length === 0,
    blockingReasons: reasons,
    warnings: warnings,
  };
}

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
