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
 * // { action: "Add", bookingRoomId: null, roomId: "room-301-id", fromDate: "2025-01-10", toDate: "2025-01-15" }
 */
export function createAddRoomOperation(
  roomId: string,
  fromDate: string,
  toDate: string
): UpdateBookingRoomRequestDto {
  return {
    action: "Add",
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
 * // { action: "Change", bookingRoomId: "booking-room-101-id", newRoomId: "room-102-id" }
 */
export function createChangeRoomOperation(
  bookingRoomId: string,
  newRoomId: string
): UpdateBookingRoomRequestDto {
  return {
    action: "Change",
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
 * // { action: "Remove", bookingRoomId: "booking-room-201-id" }
 */
export function createRemoveRoomOperation(
  bookingRoomId: string
): UpdateBookingRoomRequestDto {
  return {
    action: "Remove",
    bookingRoomId,
  };
}

/**
 * VALIDATE ROOM OPERATION
 * Check if a room operation object is valid
 *
 * @example
 * const isValid = isValidRoomOperation({ action: "Add", bookingRoomId: null, roomId: "123", fromDate: "2025-01-10", toDate: "2025-01-15" });
 * // true
 */
export function isValidRoomOperation(
  operation: UpdateBookingRoomRequestDto
): boolean {
  // ADD operation: requires roomId + dates
  if (operation.action === "Add") {
    return !!(operation.roomId && operation.fromDate && operation.toDate);
  }

  // CHANGE operation: requires bookingRoomId + newRoomId
  if (operation.action === "Change") {
    return !!(operation.bookingRoomId && operation.newRoomId);
  }

  // REMOVE operation: requires bookingRoomId
  if (operation.action === "Remove") {
    return !!operation.bookingRoomId;
  }

  return false;
}

/**
 * GET OPERATION TYPE
 * Determine which type of operation this is
 *
 * @example
 * getOperationType({ action: "Add", roomId: "123", fromDate: "...", toDate: "..." })
 * // "ADD"
 */
export function getOperationType(
  operation: UpdateBookingRoomRequestDto
): "ADD" | "CHANGE" | "REMOVE" | "INVALID" {
  if (!operation.action) return "INVALID";

  // Map action string to uppercase type
  if (operation.action === "Add") return "ADD";
  if (operation.action === "Change") return "CHANGE";
  if (operation.action === "Remove") return "REMOVE";

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
