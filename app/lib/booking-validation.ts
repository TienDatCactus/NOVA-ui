/**
 * Booking Update Validation Rules
 *
 * Implements business logic for determining when booking updates are allowed
 * based on BookingStatus and InvoiceStatus
 */

import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";
import type z from "zod";

type Invoice = z.infer<typeof InvoiceSchema.InvoiceListItemSchema>;

/**
 * Invoice statuses that indicate "financial lock" - money has been collected
 */
const LOCKED_INVOICE_STATUSES = ["PartiallyPaid", "Paid", "Overpaid"] as const;

/**
 * Invoice statuses that allow modifications
 */
const UNLOCKED_INVOICE_STATUSES = ["Unpaid", "DepositOnly"] as const;

/**
 * Booking statuses that allow heavy updates
 */
const HEAVY_UPDATE_ALLOWED_STATUSES = ["Pending", "Confirmed"] as const;

/**
 * Booking statuses that restrict heavy updates
 */
const HEAVY_UPDATE_RESTRICTED_STATUSES = [
  "CheckedIn",
  "InHouse",
  "CheckedOut",
  "Cancelled",
] as const;

/**
 * Check if a room invoice has financial lock (money collected)
 */
export function isInvoiceFinanciallyLocked(invoice: Invoice): boolean {
  return LOCKED_INVOICE_STATUSES.includes(
    invoice.status as (typeof LOCKED_INVOICE_STATUSES)[number]
  );
}

/**
 * Check if any room invoice in the booking has financial lock
 */
export function hasAnyLockedRoomInvoice(invoices: Invoice[]): boolean {
  const roomInvoices = invoices.filter((inv) => inv.invoiceType === "Room");
  return roomInvoices.some((inv) => isInvoiceFinanciallyLocked(inv));
}

/**
 * Check if booking status allows heavy updates
 */
export function isBookingStatusAllowingHeavyUpdates(status: string): boolean {
  return HEAVY_UPDATE_ALLOWED_STATUSES.includes(
    status as (typeof HEAVY_UPDATE_ALLOWED_STATUSES)[number]
  );
}

/**
 * Main validation: Can perform heavy updates?
 *
 * Returns true only if:
 * - BookingStatus is Pending or Confirmed
 * - AND all room invoices are Unpaid or DepositOnly
 */
export function canPerformHeavyUpdate(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  // Check booking status
  if (!isBookingStatusAllowingHeavyUpdates(bookingStatus)) {
    return false;
  }

  // Check invoice financial lock
  if (hasAnyLockedRoomInvoice(invoices)) {
    return false;
  }

  return true;
}

/**
 * Get detailed reason why heavy update is blocked
 */
export function getHeavyUpdateBlockReason(
  bookingStatus: string,
  invoices: Invoice[]
): string | null {
  if (!isBookingStatusAllowingHeavyUpdates(bookingStatus)) {
    return "Không thể thay đổi cấu trúc booking khi khách đã check-in hoặc booking đã hoàn tất. Vui lòng sử dụng chức năng Void/Refund.";
  }

  if (hasAnyLockedRoomInvoice(invoices)) {
    return "Không thể cập nhật thông tin phòng vì booking đã có hóa đơn đã thanh toán một phần hoặc toàn bộ. Vui lòng sử dụng chức năng Void/Refund.";
  }

  return null;
}

/**
 * Soft updates are always allowed regardless of status
 */
export function canPerformSoftUpdate(): boolean {
  return true;
}

/**
 * Check if adding rooms is allowed
 * (Same as heavy update rules)
 */
export function canAddRooms(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  return canPerformHeavyUpdate(bookingStatus, invoices);
}

/**
 * Check if removing rooms is allowed
 * (Stricter than adding - only when invoices are unlocked)
 */
export function canRemoveRooms(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  return canPerformHeavyUpdate(bookingStatus, invoices);
}

/**
 * Check if changing dates is allowed
 */
export function canChangeDates(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  return canPerformHeavyUpdate(bookingStatus, invoices);
}

/**
 * Helper to get all room invoices from invoice list
 */
export function getRoomInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter((inv) => inv.invoiceType === "Room");
}

/**
 * Helper to get locked room invoices
 */
export function getLockedRoomInvoices(invoices: Invoice[]): Invoice[] {
  return getRoomInvoices(invoices).filter((inv) =>
    isInvoiceFinanciallyLocked(inv)
  );
}
