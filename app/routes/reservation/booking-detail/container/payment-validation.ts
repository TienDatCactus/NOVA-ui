import type { z } from "zod";
import type { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

type InvoiceStatus = z.infer<typeof InvoiceSchema.InvoiceStatusEnum>;

/**
 * Payment eligibility rules based on invoice status
 * Following NOVA-UI Design Philosophy #4 (Hierarchy) - clear business logic
 */
export const PAYMENT_RULES: Record<
  string,
  {
    canAcceptPayment: boolean;
    canCheckout: boolean;
    reason?: string;
    userMessage?: string;
  }
> = {
  Unpaid: {
    canAcceptPayment: true,
    canCheckout: false,
    userMessage: "Chưa thanh toán - cần thanh toán đủ",
  },
  DepositOnly: {
    canAcceptPayment: true,
    canCheckout: false,
    userMessage: "Đã đặt cọc - cần thanh toán phần còn lại",
  },
  PartiallyPaid: {
    canAcceptPayment: true,
    canCheckout: false,
    userMessage: "Đã thanh toán một phần - cần thanh toán phần còn lại",
  },

  // ✅ Fully paid - no more payment needed
  Paid: {
    canAcceptPayment: false,
    canCheckout: true,
    reason: "Invoice đã thanh toán đủ",
    userMessage: "Đã thanh toán đủ - có thể checkout",
  },

  Overpaid: {
    canAcceptPayment: false,
    canCheckout: false,
    reason: "Khách đã thanh toán thừa - cần hoàn trả trước",
    userMessage: "Đã thanh toán thừa - cần hoàn trả khách hàng",
  },

  Refunded: {
    canAcceptPayment: false,
    canCheckout: false,
    reason: "Invoice đã được hoàn trả",
    userMessage: "Hóa đơn đã hoàn trả - không thể thanh toán",
  },
  Chargeback: {
    canAcceptPayment: false,
    canCheckout: false,
    reason: "Invoice đang trong tranh chấp",
    userMessage: "Hóa đơn tranh chấp - liên hệ quản lý",
  },
  Voided: {
    canAcceptPayment: false,
    canCheckout: false,
    reason: "Invoice đã bị hủy",
    userMessage: "Hóa đơn đã hủy - không thể thanh toán",
  },
};

/**
 * Determine if invoice can accept payment
 * @returns { canProceed, reason, userMessage }
 */
export function canInvoiceAcceptPayment(status: InvoiceStatus): {
  canProceed: boolean;
  reason?: string;
  userMessage?: string;
  suggestedAction?: "pay" | "checkout" | "refund" | "contact-admin";
} {
  const rule = PAYMENT_RULES[status] || PAYMENT_RULES.Unpaid;

  // Determine suggested action
  let suggestedAction: "pay" | "checkout" | "refund" | "contact-admin" = "pay";
  if (status === "Paid") suggestedAction = "checkout";
  if (status === "Overpaid") suggestedAction = "refund";
  if (["Refunded", "Chargeback", "Voided"].includes(status)) {
    suggestedAction = "contact-admin";
  }

  return {
    canProceed: rule.canAcceptPayment,
    reason: rule.reason,
    userMessage: rule.userMessage,
    suggestedAction,
  };
}

/**
 */
export function validatePaymentAmount(
  amount: number,
  balance: number,
  total: number,
  status: InvoiceStatus
): {
  isValid: boolean;
  error?: string;
} {
  const EPSILON = 0.01; // Floating point tolerance

  const eligibility = canInvoiceAcceptPayment(status);
  if (!eligibility.canProceed) {
    return {
      isValid: false,
      error: eligibility.userMessage,
    };
  }

  // No negative payments
  if (amount < 0) {
    return {
      isValid: false,
      error: "Số tiền không được âm",
    };
  }

  // Must not exceed total invoice
  if (amount > total && Math.abs(amount - total) > EPSILON) {
    return {
      isValid: false,
      error: `Số tiền vượt quá tổng hóa đơn (${amount - total} VND thừa)`,
    };
  }

  // NOVA business rule: must pay in full (strict policy)
  if (amount < balance && Math.abs(amount - balance) > EPSILON) {
    return {
      isValid: false,
      error: "Phải thanh toán đủ số tiền còn thiếu",
    };
  }

  return { isValid: true };
}
