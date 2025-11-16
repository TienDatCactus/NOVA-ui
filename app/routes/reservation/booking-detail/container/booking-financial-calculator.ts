import type { InvoiceListItemDto } from "~/services/api/invoices/dto";

/**
 * Financial status types computed from invoices
 */
export type BookingFinancialStatus =
  | "Unpaid"
  | "PartiallyPaid"
  | "Paid"
  | "Overpaid";

/**
 * Financial summary for a booking
 */
export interface BookingFinancialSummary {
  financialStatus: BookingFinancialStatus;
  totalInvoiced: number;
  totalPaid: number;
  totalBalance: number;
  unpaidInvoiceCount: number;
  paidInvoiceCount: number;
}

/**
 * Calculate booking financial status from invoices
 * Pure frontend calculation - no backend changes needed
 */
export function calculateBookingFinancialStatus(
  invoices: InvoiceListItemDto[] | undefined
): BookingFinancialSummary {
  // Filter out voided invoices
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

  // Calculate totals
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

  // Count paid/unpaid invoices
  const unpaidInvoiceCount = activeInvoices.filter(
    (inv) => (inv.balance || 0) > 0
  ).length;
  const paidInvoiceCount = activeInvoices.filter(
    (inv) => inv.status === "Paid"
  ).length;

  // Determine financial status
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

/**
 * Check if booking can proceed with checkout
 * Returns blocking reasons and warnings
 */
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
  if (!["InHouse", "CheckedIn"].includes(bookingStatus)) {
    reasons.push("Booking chưa ở trạng thái InHouse/CheckedIn");
  }

  // Rule 2: No pending orders (existing logic)
  const totalPendingOrders =
    (pendingOrders?.posOrders?.length || 0) +
    (pendingOrders?.serviceOrders?.length || 0);

  if (totalPendingOrders > 0) {
    reasons.push(
      `Còn ${totalPendingOrders} order chưa được tạo invoice. Vui lòng tạo checkout invoice trước.`
    );
  }

  // Rule 3: All invoices must be paid (NEW - core validation)
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
      `Còn ${unpaidInvoices.length} hóa đơn chưa thanh toán (tổng: ${new Intl.NumberFormat(
        "vi-VN",
        {
          style: "currency",
          currency: "VND",
        }
      ).format(totalUnpaid)})`
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
      `Có ${overpaidInvoices.length} hóa đơn thanh toán thừa (${new Intl.NumberFormat(
        "vi-VN",
        {
          style: "currency",
          currency: "VND",
        }
      ).format(
        totalOverpaid
      )}). Khách hàng cần được hoàn trả trước khi checkout.`
    );
  }

  return {
    canProceed: reasons.length === 0,
    blockingReasons: reasons,
    warnings: warnings,
  };
}

/**
 * Format financial status for display
 */
export function getFinancialStatusLabel(
  status: BookingFinancialStatus
): string {
  const labels: Record<BookingFinancialStatus, string> = {
    Unpaid: "Chưa thanh toán",
    PartiallyPaid: "Thanh toán một phần",
    Paid: "Đã thanh toán",
    Overpaid: "Thanh toán thừa",
  };
  return labels[status];
}

/**
 * Get variant for financial status badge
 */
export function getFinancialStatusVariant(
  status: BookingFinancialStatus
): "default" | "secondary" | "destructive" | "outline" | "success" {
  const variants: Record<
    BookingFinancialStatus,
    "default" | "secondary" | "destructive" | "outline" | "success"
  > = {
    Unpaid: "destructive",
    PartiallyPaid: "secondary",
    Paid: "success",
    Overpaid: "outline",
  };
  return variants[status];
}
