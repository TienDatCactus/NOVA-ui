/**
 * Hook for handling payment gateway redirects
 *
 * Usage:
 * ```tsx
 * const { handlePaymentResponse } = usePaymentRedirect();
 *
 * // In mutation onSuccess:
 * const redirected = handlePaymentResponse(result);
 * if (!redirected) {
 *   // Cash payment completed
 *   toast.success("Thanh toán thành công");
 * }
 * ```
 */

export interface PaymentRedirectResult {
  requiresPaymentAction: boolean;
  paymentUrl?: string | null;
  paymentProvider?: string | null;
}

export function usePaymentRedirect() {
  /**
   * Handle payment response and redirect if needed
   * @param result - Payment response from backend
   * @returns true if redirected, false if payment completed (Cash)
   */
  const handlePaymentResponse = (result: PaymentRedirectResult): boolean => {
    if (result.requiresPaymentAction && result.paymentUrl) {
      // Redirect to payment gateway
      window.location.href = result.paymentUrl;
      return true; // Indicates redirect happened
    }

    // Cash payment completed directly
    return false;
  };

  /**
   * Check if payment method requires gateway redirect
   * @param method - Payment method (Cash, Card, BankTransfer, etc.)
   * @returns true if method requires redirect
   */
  const requiresGateway = (method: string): boolean => {
    const gatewayMethods = ["Card", "BankTransfer"];
    return gatewayMethods.includes(method);
  };

  return {
    handlePaymentResponse,
    requiresGateway,
  };
}
