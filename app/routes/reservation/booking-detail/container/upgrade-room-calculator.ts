import { addDays, differenceInDays, parseISO } from "date-fns";

/**
 * Calculate remaining nights for upgrade surcharge
 * Per CHANGELOG v2.0 Section 4:
 * - If CheckedIn (InHouse): Calculate from TOMORROW → checkout
 * - If Confirmed: Calculate full stay (checkin → checkout)
 */
export function calculateRemainingNights(
  bookingStatus: string,
  checkinDate: string | Date,
  checkoutDate: string | Date
): number {
  const isInHouse =
    bookingStatus === "CheckedIn" || bookingStatus === "InHouse";

  const checkin =
    typeof checkinDate === "string" ? parseISO(checkinDate) : checkinDate;
  const checkout =
    typeof checkoutDate === "string" ? parseISO(checkoutDate) : checkoutDate;

  if (isInHouse) {
    // When InHouse, count from TOMORROW (guest already paid for tonight with old room rate)
    const tomorrow = addDays(new Date(), 1);
    const remaining = differenceInDays(checkout, tomorrow);
    return Math.max(0, remaining); // Cannot be negative
  }

  // For Confirmed: full stay
  return differenceInDays(checkout, checkin);
}

/**
 * Calculate upgrade surcharge
 * Formula: (newRoomRate - oldRoomRate) × remainingNights
 */
export function calculateUpgradeSurcharge(
  oldRoomDailyRate: number,
  newRoomDailyRate: number,
  remainingNights: number
): number {
  const rateDifference = newRoomDailyRate - oldRoomDailyRate;
  return rateDifference * remainingNights;
}

/**
 * Validate if room qualifies as upgrade (higher base rate)
 */
export function isValidUpgrade(
  oldRoomDailyRate: number,
  newRoomDailyRate: number
): boolean {
  return newRoomDailyRate > oldRoomDailyRate;
}

/**
 * Get upgrade validation message
 */
export function getUpgradeValidationMessage(
  remainingNights: number
): string | null {
  if (remainingNights <= 0) {
    return "Không còn đêm nào để upgrade (checkout quá gần hoặc đã qua).";
  }

  return null;
}
