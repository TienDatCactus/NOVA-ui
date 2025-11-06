/**
 * EXAMPLE: Room Operations UI Component
 *
 * This example demonstrates how to use the UpdateBookingRequestDto
 * room operations in a real React component.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  createAddRoomOperation,
  createChangeRoomOperation,
  createRemoveRoomOperation,
  getOperationType,
} from "~/services/api/booking/booking.helpers";
import type { UpdateBookingRoomRequestDto } from "~/services/api/booking/dto";
import { BookingService } from "~/services/api/booking";

interface Room {
  id: string;
  name: string;
  bookingRoomId?: string;
}

interface RoomOperationsExampleProps {
  bookingId: string;
  currentRooms: Room[];
  availableRooms: Room[];
}

export default function RoomOperationsExample({
  bookingId,
  currentRooms,
  availableRooms,
}: RoomOperationsExampleProps) {
  const [operations, setOperations] = useState<UpdateBookingRoomRequestDto[]>(
    []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * EXAMPLE 1: Add a new room
   */
  const handleAddRoom = (roomId: string) => {
    const fromDate = "2025-01-10";
    const toDate = "2025-01-15";

    const operation = createAddRoomOperation(roomId, fromDate, toDate);

    setOperations([...operations, operation]);

    toast.success(
      `Đã thêm thao tác: ADD room ${roomId} (${fromDate} → ${toDate})`
    );
  };

  /**
   * EXAMPLE 2: Change an existing room
   */
  const handleChangeRoom = (bookingRoomId: string, newRoomId: string) => {
    const operation = createChangeRoomOperation(bookingRoomId, newRoomId);

    setOperations([...operations, operation]);

    toast.success(
      `Đã thêm thao tác: CHANGE room ${bookingRoomId} → ${newRoomId}`
    );
  };

  /**
   * EXAMPLE 3: Remove a room
   */
  const handleRemoveRoom = (bookingRoomId: string) => {
    const operation = createRemoveRoomOperation(bookingRoomId);

    setOperations([...operations, operation]);

    toast.success(`Đã thêm thao tác: REMOVE room ${bookingRoomId}`);
  };

  /**
   * EXAMPLE 4: Submit all operations at once
   */
  const handleSubmitOperations = async () => {
    if (operations.length === 0) {
      toast.error("Chưa có thao tác nào để thực hiện");
      return;
    }

    setIsUpdating(true);

    try {
      // Send all operations in a single request
      const response = await BookingService.staffUpdateBookingDetail(
        bookingId,
        {
          rooms: operations,
        }
      );

      toast.success(`Cập nhật thành công! Booking: ${response.bookingCode}`);

      // Clear operations after success
      setOperations([]);
    } catch (error: any) {
      // Handle specific error codes
      switch (error.code) {
        case "ROOM_OCCUPIED":
          toast.error("Phòng đã có khách ở, không thể đổi");
          break;
        case "ROOM_TYPE_MISMATCH":
          toast.error("Chỉ được đổi sang phòng cùng hạng");
          break;
        case "ROOM_NOT_AVAILABLE":
          toast.error("Phòng không khả dụng trong thời gian này");
          break;
        default:
          toast.error("Có lỗi xảy ra khi cập nhật booking");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * EXAMPLE 5: Clear all pending operations
   */
  const handleClearOperations = () => {
    setOperations([]);
    toast.info("Đã xóa tất cả thao tác chưa lưu");
  };

  /**
   * EXAMPLE 6: Preview operations before submitting
   */
  const renderOperationPreview = (
    op: UpdateBookingRoomRequestDto,
    index: number
  ) => {
    const type = getOperationType(op);

    let description = "";
    switch (type) {
      case "ADD":
        description = `Thêm phòng ${op.roomId} (${op.fromDate} → ${op.toDate})`;
        break;
      case "CHANGE":
        description = `Đổi phòng ${op.bookingRoomId} → ${op.newRoomId}`;
        break;
      case "REMOVE":
        description = `Xóa phòng ${op.bookingRoomId}`;
        break;
      default:
        description = "Thao tác không hợp lệ";
    }

    return (
      <Card key={index} className="p-3 flex items-center justify-between">
        <div>
          <span className="font-semibold">{type}</span>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newOps = operations.filter((_, i) => i !== index);
            setOperations(newOps);
          }}
        >
          Hủy
        </Button>
      </Card>
    );
  };

  /**
   * EXAMPLE 7: Combined update (booking info + room operations)
   */
  const handleCombinedUpdate = async () => {
    setIsUpdating(true);

    try {
      const response = await BookingService.staffUpdateBookingDetail(
        bookingId,
        {
          // Update booking info
          adultsAmount: 4,
          note: "Khách VIP, cần late checkout",

          // AND perform room operations
          rooms: operations,
        }
      );

      toast.success(`Cập nhật thành công: ${response.bookingCode}`);
      setOperations([]);
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Rooms Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Phòng hiện tại</h3>
        <div className="grid gap-2">
          {currentRooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-muted-foreground">ID: {room.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newRoom = availableRooms[0];
                    if (room.bookingRoomId && newRoom) {
                      handleChangeRoom(room.bookingRoomId, newRoom.id);
                    }
                  }}
                >
                  Đổi phòng
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (room.bookingRoomId) {
                      handleRemoveRoom(room.bookingRoomId);
                    }
                  }}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Rooms Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Phòng khả dụng</h3>
        <div className="grid gap-2">
          {availableRooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{room.name}</p>
                <p className="text-sm text-muted-foreground">ID: {room.id}</p>
              </div>
              <Button size="sm" onClick={() => handleAddRoom(room.id)}>
                Thêm phòng
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Operations Preview */}
      {operations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Thao tác chờ lưu ({operations.length})
          </h3>
          <div className="space-y-2">
            {operations.map((op, index) => renderOperationPreview(op, index))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSubmitOperations}
          disabled={operations.length === 0 || isUpdating}
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCombinedUpdate}
          disabled={operations.length === 0 || isUpdating}
        >
          Lưu (kết hợp thông tin booking)
        </Button>
        <Button
          variant="ghost"
          onClick={handleClearOperations}
          disabled={operations.length === 0}
        >
          Hủy tất cả
        </Button>
      </div>
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 *
 * <RoomOperationsExample
 *   bookingId="abc-123-guid"
 *   currentRooms={[
 *     { id: "room-101", name: "Deluxe 101", bookingRoomId: "booking-room-1" },
 *     { id: "room-102", name: "Deluxe 102", bookingRoomId: "booking-room-2" }
 *   ]}
 *   availableRooms={[
 *     { id: "room-201", name: "Suite 201" },
 *     { id: "room-202", name: "Suite 202" }
 *   ]}
 * />
 */
