import type { UpdateBookingRoomRequestDto } from "./dto";

/**
 * Helper utilities for UpdateBookingRequestDto room operations
 *
 * Three operation types:
 * 1. ADD: Add a new room to the booking
 * 2. CHANGE: Swap an existing room to a different room
 * 3. REMOVE: Remove a room from the booking
 */

/**
 * CREATE ADD OPERATION ➕
 * Add a new room to the booking
 *
 * @example
 * const addRoomOp = createAddRoomOperation(
 *   "room-301-id",
 *   "2025-01-10",
 *   "2025-01-15"
 * );
 * // { bookingRoomId: null, roomId: "room-301-id", fromDate: "2025-01-10", toDate: "2025-01-15" }
 */
export function createAddRoomOperation(
  roomId: string,
  fromDate: string,
  toDate: string
): UpdateBookingRoomRequestDto {
  return {
    bookingRoomId: null,
    roomId,
    fromDate,
    toDate,
  };
}

/**
 * CREATE CHANGE OPERATION 🔄
 * Swap an existing room to a different room (keeps same dates)
 *
 * @example
 * const changeRoomOp = createChangeRoomOperation(
 *   "booking-room-101-id",
 *   "room-102-id"
 * );
 * // { bookingRoomId: "booking-room-101-id", newRoomId: "room-102-id" }
 */
export function createChangeRoomOperation(
  bookingRoomId: string,
  newRoomId: string
): UpdateBookingRoomRequestDto {
  return {
    bookingRoomId,
    newRoomId,
  };
}

/**
 * CREATE REMOVE OPERATION ❌
 * Remove a room from the booking
 *
 * @example
 * const removeRoomOp = createRemoveRoomOperation("booking-room-201-id");
 * // { bookingRoomId: "booking-room-201-id", remove: true }
 */
export function createRemoveRoomOperation(
  bookingRoomId: string
): UpdateBookingRoomRequestDto {
  return {
    bookingRoomId,
    remove: true,
  };
}

/**
 * VALIDATE ROOM OPERATION
 * Check if a room operation object is valid
 *
 * @example
 * const isValid = isValidRoomOperation({ bookingRoomId: null, roomId: "123" });
 * // false (missing fromDate and toDate)
 */
export function isValidRoomOperation(
  operation: UpdateBookingRoomRequestDto
): boolean {
  // ADD operation: bookingRoomId is null, requires roomId + dates
  if (operation.bookingRoomId === null) {
    return !!(operation.roomId && operation.fromDate && operation.toDate);
  }

  // CHANGE operation: requires bookingRoomId + newRoomId
  if (operation.newRoomId) {
    return !!operation.bookingRoomId;
  }

  // REMOVE operation: requires bookingRoomId + remove flag
  if (operation.remove) {
    return !!operation.bookingRoomId;
  }

  return false;
}

/**
 * GET OPERATION TYPE
 * Determine which type of operation this is
 *
 * @example
 * getOperationType({ bookingRoomId: null, roomId: "123", fromDate: "...", toDate: "..." })
 * // "ADD"
 */
export function getOperationType(
  operation: UpdateBookingRoomRequestDto
): "ADD" | "CHANGE" | "REMOVE" | "INVALID" {
  if (operation.bookingRoomId === null && operation.roomId) {
    return "ADD";
  }
  if (operation.bookingRoomId && operation.newRoomId) {
    return "CHANGE";
  }
  if (operation.bookingRoomId && operation.remove) {
    return "REMOVE";
  }
  return "INVALID";
}

/**
 * EXAMPLE USAGE:
 *
 * // Single operation: Add a room
 * const addRoom = createAddRoomOperation("room-123", "2025-01-10", "2025-01-15");
 * await BookingService.staffUpdateBookingDetail(bookingId, {
 *   rooms: [addRoom]
 * });
 *
 * // Single operation: Change room
 * const changeRoom = createChangeRoomOperation("booking-room-101", "new-room-102");
 * await BookingService.staffUpdateBookingDetail(bookingId, {
 *   rooms: [changeRoom]
 * });
 *
 * // Single operation: Remove room
 * const removeRoom = createRemoveRoomOperation("booking-room-201");
 * await BookingService.staffUpdateBookingDetail(bookingId, {
 *   rooms: [removeRoom]
 * });
 *
 * // Multiple operations combined
 * const operations = [
 *   createChangeRoomOperation("booking-room-101", "new-room-102"),
 *   createRemoveRoomOperation("booking-room-201"),
 *   createAddRoomOperation("room-301", "2025-01-10", "2025-01-15")
 * ];
 *
 * await BookingService.staffUpdateBookingDetail(bookingId, {
 *   adultsAmount: 4,
 *   rooms: operations
 * });
 */
