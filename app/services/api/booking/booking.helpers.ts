import { format } from "date-fns";
import { BookingSchema } from "./booking.schema";
import type { UpdateBookingRoomRequestDto } from "./dto";

const { UpdateBookingRoomRequestSchema } = BookingSchema;

/**
 * Creates a validated "Add" room operation
 * @throws Error if validation fails
 */
export function createAddRoomOperation(
  roomId: string,
  fromDate: string | Date,
  toDate: string | Date
): UpdateBookingRoomRequestDto {
  // Validate inputs
  if (!roomId || (typeof roomId === "string" && roomId.trim() === "")) {
    throw new Error("Room ID không hợp lệ");
  }

  if (!fromDate || !toDate) {
    throw new Error("Ngày checkin/checkout không được để trống");
  }

  // Normalize dates to yyyy-MM-dd format
  let from: string;
  let to: string;

  try {
    from = fromDate instanceof Date ? format(fromDate, "yyyy-MM-dd") : fromDate;
    to = toDate instanceof Date ? format(toDate, "yyyy-MM-dd") : toDate;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      throw new Error(`Ngày checkin không đúng format yyyy-MM-dd: ${from}`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      throw new Error(`Ngày checkout không đúng format yyyy-MM-dd: ${to}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("format")) {
      throw error;
    }
    throw new Error(
      `Lỗi định dạng ngày: ${error instanceof Error ? error.message : "Unknown"}`
    );
  }

  const operation = {
    action: "Add" as const,
    bookingRoomId: null,
    roomId: roomId.trim(),
    fromDate: from,
    toDate: to,
  };

  // Validate before returning
  const result = UpdateBookingRoomRequestSchema.safeParse(operation);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Dữ liệu phòng không hợp lệ: ${errorMessages}`);
  }

  return result.data;
}

/**
 * Creates a validated "Change" room operation
 * @throws Error if validation fails
 */
export function createChangeRoomOperation(
  bookingRoomId: string,
  newRoomId: string,
  fromDate?: string | Date,
  toDate?: string | Date
): UpdateBookingRoomRequestDto {
  const operation: UpdateBookingRoomRequestDto = {
    action: "Change" as const,
    bookingRoomId,
    newRoomId,
  };

  // Add optional dates if provided
  if (fromDate) {
    operation.fromDate =
      fromDate instanceof Date ? format(fromDate, "yyyy-MM-dd") : fromDate;
  }
  if (toDate) {
    operation.toDate =
      toDate instanceof Date ? format(toDate, "yyyy-MM-dd") : toDate;
  }

  const result = UpdateBookingRoomRequestSchema.safeParse(operation);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Dữ liệu đổi phòng không hợp lệ: ${errorMessages}`);
  }

  return result.data;
}

/**
 * Creates a validated "Remove" room operation
 * @throws Error if validation fails
 */
export function createRemoveRoomOperation(
  bookingRoomId: string
): UpdateBookingRoomRequestDto {
  const operation = {
    action: "Remove" as const,
    bookingRoomId,
  };

  const result = UpdateBookingRoomRequestSchema.safeParse(operation);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    throw new Error(`Dữ liệu xóa phòng không hợp lệ: ${errorMessages}`);
  }

  return result.data;
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
