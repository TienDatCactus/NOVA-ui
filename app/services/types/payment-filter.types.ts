/**
 * Payment method filtering based on booking source
 *
 * Business Rules:
 * - Direct bookings (DirectStaff, DirectCustomer): Cash, Card, BankTransfer
 * - OTA/Agency bookings: OTAPrepaid, OTACollect, OnAccount
 */

export type BookingSourceType =
  | "DirectStaff"
  | "DirectCustomer"
  | "OTA"
  | "Agency"
  | "RoomBlock";

export const DIRECT_PAYMENT_METHODS = ["Cash", "Card", "BankTransfer"] as const;

export const OTA_PAYMENT_METHODS = [
  "OTAPrepaid",
  "OTACollect",
  "OnAccount",
] as const;

export type DirectPaymentMethod = (typeof DIRECT_PAYMENT_METHODS)[number];
export type OTAPaymentMethod = (typeof OTA_PAYMENT_METHODS)[number];

/**
 * Get available payment methods based on booking source
 * @param source - Booking source type
 * @returns Array of allowed payment method values
 */
export function getAvailablePaymentMethods(
  source: BookingSourceType | string | undefined
): readonly string[] {
  if (!source) {
    return DIRECT_PAYMENT_METHODS;
  }

  // Direct bookings → Cash, Card, BankTransfer
  if (source === "DirectStaff" || source === "DirectCustomer") {
    return DIRECT_PAYMENT_METHODS;
  }

  // OTA/Agency bookings → OTAPrepaid, OTACollect, OnAccount
  if (source === "OTA" || source === "Agency") {
    return OTA_PAYMENT_METHODS;
  }

  // RoomBlock → use direct methods
  if (source === "RoomBlock") {
    return DIRECT_PAYMENT_METHODS;
  }

  // Default to direct methods
  return DIRECT_PAYMENT_METHODS;
}

/**
 * Check if a payment method is valid for a booking source
 */
export function isPaymentMethodAllowed(
  method: string,
  source: BookingSourceType | string | undefined
): boolean {
  const allowedMethods = getAvailablePaymentMethods(source);
  return allowedMethods.includes(method);
}
