import { DASHBOARD } from "~/lib/fe-url";

interface PaymentCallbackContext {
  type: "booking" | "pos-order" | "service-order" | "invoice";
  id: string;
  bookingCode?: string;
}

/**
 * Build callback URLs for payment gateway redirects
 * @param context - Payment context information
 * @returns Object with successUrl and cancelUrl
 */
export function buildPaymentCallbackUrls(context: PaymentCallbackContext) {
  const baseUrl = window.location.origin;

  // Build query params
  const params = new URLSearchParams({
    type: context.type,
    id: context.id,
  });

  if (context.bookingCode) {
    params.set("bookingCode", context.bookingCode);
  }

  return {
    successUrl: `${baseUrl}${DASHBOARD.payment.success}?${params.toString()}`,
    cancelUrl: `${baseUrl}${DASHBOARD.payment.cancel}?${params.toString()}`,
  };
}

/**
 * Parse callback URL query parameters
 * @returns Parsed payment callback context or null if invalid
 */
export function parsePaymentCallbackParams(): PaymentCallbackContext | null {
  const params = new URLSearchParams(window.location.search);

  const type = params.get("type") as PaymentCallbackContext["type"] | null;
  const id = params.get("id");
  const bookingCode = params.get("bookingCode");

  if (!type || !id) {
    return null;
  }

  return {
    type,
    id,
    bookingCode: bookingCode || undefined,
  };
}
