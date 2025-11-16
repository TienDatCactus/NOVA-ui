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
 * Check if a room invoice has financial lock (money collected)
 */
export function isInvoiceFinanciallyLocked(invoice: Invoice): boolean {
  return LOCKED_INVOICE_STATUSES.includes(
    invoice.status as (typeof LOCKED_INVOICE_STATUSES)[number]
  );
}

/**
 * Check if any room-related invoice has been paid
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

/**
 * Main validation: Can perform heavy updates (rooms, dates)?
 *
 * Returns true only if:
 * - BookingStatus is Pending
 * - AND no room invoices have been paid
 */
export function canPerformHeavyUpdate(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  if (bookingStatus !== "Pending") {
    return false;
  }

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
  if (bookingStatus !== "Pending") {
    return "Không thể thay đổi cấu trúc booking khi khách đã check-in hoặc booking đã hoàn tất. Vui lòng sử dụng chức năng Void/Refund.";
  }

  if (hasAnyLockedRoomInvoice(invoices)) {
    return "Không thể cập nhật thông tin phòng vì booking đã có hóa đơn đã thanh toán một phần hoặc toàn bộ. Vui lòng sử dụng chức năng Void/Refund.";
  }

  return null;
}

/**
 * Soft updates (adults, children, totalAmount, breakfast, notes)
 * Only allowed in Pending status
 */
export function canPerformSoftUpdate(bookingStatus: string): boolean {
  return bookingStatus === "Pending";
}

/**
 * Check if adding rooms is allowed
 * Only Pending status with no payments
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
 *
 * STRICT RULE: Only Pending status with no payments
 */
export function canChangeDates(
  bookingStatus: string,
  invoices: Invoice[]
): boolean {
  if (bookingStatus !== "Pending") {
    return false;
  }

  // Cannot change if any payment exists
  return !invoices.some((inv) => isInvoiceFinanciallyLocked(inv));
}

/**
 * Get detailed reason why date change is blocked
 */
export function getDateChangeBlockReason(
  bookingStatus: string,
  invoices: Invoice[]
): string | null {
  // Check status first
  if (
    bookingStatus === "CheckedIn" ||
    bookingStatus === "InHouse" ||
    bookingStatus === "CheckedOut" ||
    bookingStatus === "Cancelled" ||
    bookingStatus === "NoShow"
  ) {
    return "Không thể thay đổi ngày check-in/check-out sau khi khách đã nhận phòng hoặc booking đã hoàn tất.";
  }

  if (bookingStatus === "Confirmed") {
    return "Không thể thay đổi ngày sau khi booking đã được xác nhận.";
  }

  // Check payment lock
  const hasAnyPayment = invoices.some((inv) => isInvoiceFinanciallyLocked(inv));

  if (hasAnyPayment) {
    const paidInvoices = invoices.filter((inv) =>
      isInvoiceFinanciallyLocked(inv)
    );
    const invoiceTypes = paidInvoices.map((inv) => inv.invoiceType).join(", ");
    return `Không thể thay đổi ngày check-in/check-out vì đã có thanh toán (${invoiceTypes}). Vui lòng hoàn trả thanh toán trước khi thay đổi ngày.`;
  }

  return null;
}
