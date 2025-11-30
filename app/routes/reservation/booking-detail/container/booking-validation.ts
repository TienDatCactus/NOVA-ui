import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import type z from "zod";

type Invoice = z.infer<typeof InvoiceSchema.InvoiceListItemSchema>;

/** Statuses that allow structural changes (if unpaid) */
const PRE_STAY_STATUSES = ["Pending", "Confirmed"];

/** Statuses that indicate the guest is currently valid in system */
const ACTIVE_STAY_STATUSES = ["CheckedIn", "InHouse"];

/** Statuses considered "Dead" - limited updates allowed */
const CLOSED_STATUSES = ["CheckedOut", "Cancelled", "NoShow"];

/** Invoice statuses that indicate "financial lock" */
const LOCKED_INVOICE_STATUSES = ["PartiallyPaid", "Paid", "Overpaid"] as const;

// --- HELPERS ---

/**
 * Check if a room invoice has financial lock (money collected)
 */
export function isInvoiceFinanciallyLocked(invoice: Invoice): boolean {
  return LOCKED_INVOICE_STATUSES.includes(
    invoice.status as (typeof LOCKED_INVOICE_STATUSES)[number]
  );
}

/**
 * Check if any room-related invoice has been paid
 * (Used to lock Dates, Room Changes, Guest Counts)
 */
export function hasAnyLockedRoomInvoice(invoices: Invoice[]): boolean {
  const roomInvoices = invoices.filter(
    (inv) =>
      inv.invoiceType === "RoomCharges" ||
      inv.invoiceType === "Deposit" ||
      inv.invoiceType === "Checkout"
  );
  return roomInvoices.some((inv) => isInvoiceFinanciallyLocked(inv));
}

// --- VALIDATION RULES ---

/**
 * 1. Validate: Non-Structural Updates
 * Fields: Note, OTA Info, Customer Info
 * Rule: Allowed everywhere EXCEPT Cancelled
 */
export function canUpdateNonStructural(bookingStatus: string): boolean {
  return bookingStatus !== "Cancelled";
}

/**
 * 2. Validate: Update Dates (Check-in / Check-out)
 * Rule:
 * - Only Pending/Confirmed
 * - Must NOT have locked invoices
 */
export function canUpdateDates(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  // Strict: Cannot change dates if guest already checked in (per current docs)
  if (!PRE_STAY_STATUSES.includes(bookingStatus)) {
    return false;
  }

  // Financial Lock: Cannot change dates if money paid
  if (hasAnyLockedRoomInvoice(invoices)) {
    return false;
  }

  return true;
}

/**
 * Get reason why Date Update is blocked
 */
export function getDateUpdateBlockReason(
  bookingStatus: string,
  invoices: Invoice[]
): string | null {
  if (ACTIVE_STAY_STATUSES.includes(bookingStatus)) {
    return "Không thể thay đổi ngày khi khách đang ở (CheckedIn). Vui lòng checkout hoặc tạo booking mới cho ngày gia hạn.";
  }

  if (CLOSED_STATUSES.includes(bookingStatus)) {
    return "Không thể thay đổi ngày cho booking đã kết thúc hoặc hủy.";
  }

  if (hasAnyLockedRoomInvoice(invoices)) {
    return "Booking đã có thanh toán. Vui lòng Void/Refund hóa đơn trước khi đổi ngày.";
  }

  return null;
}

/**
 * 3. Validate: Add Room
 * Rule:
 * - Allowed for Pending/Confirmed (if unpaid)
 * - ESPECIALLY ALLOWED for CheckedIn/InHouse (Guest wants extra room)
 */
export function canAddRoom(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  // Case A: Guest is already here -> Allow adding more rooms
  if (ACTIVE_STAY_STATUSES.includes(bookingStatus)) {
    return true;
  }

  // Case B: Future booking -> Allow only if no financial lock
  if (PRE_STAY_STATUSES.includes(bookingStatus)) {
    return !hasAnyLockedRoomInvoice(invoices);
  }

  return false;
}

/**
 * 4. Validate: Change/Remove Room & Guest Count
 * Rule: Stricter than Add Room.
 * - Only Pending/Confirmed
 * - No financial lock
 */
export function canModifyExistingStructure(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  if (!PRE_STAY_STATUSES.includes(bookingStatus)) {
    return false;
  }

  if (hasAnyLockedRoomInvoice(invoices)) {
    return false;
  }

  return true;
}

export function canUpdateTotalAmount(bookingStatus: string): boolean {
  // Allow almost everywhere except Cancelled
  return bookingStatus !== "Cancelled";
}

export function isBookingCompletelyLocked(bookingStatus: string): boolean {
  return bookingStatus === "Cancelled";
}

export function canUpdateGuestCount(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  return canModifyExistingStructure(bookingStatus, invoices);
}
