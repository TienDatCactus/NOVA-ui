import z from "zod";
import usePaymentSchema from "./payment.schema";
import { ROOM_TYPE } from "../types/room.types";

const { PaymentMethodEnum } = usePaymentSchema();

// -------------------------------

const RoomTypeEnum = z.enum(ROOM_TYPE, {
  error: "Loại phòng không hợp lệ",
});

const RoomStatusEnum = z.enum({
  Available: "0", // Còn trống
  Occupied: "1", // Đã có khách
  Dirty: "2", // Cần dọn dẹp
  OutOfService: "3", // Ngưng sử dụng
  Reserved: "4", // Đã được đặt trước
  Cleaning: "5", // Đang được dọn dẹp
  Locked: "6",
});

// -------------------------------

const RoomListItemSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  status: z.string(),
  roomTypeId: z.string(),
  roomTypeCode: z.string(),
  roomTypeName: z.string(),
  imageUrls: z.array(z.string()),
  dailyPrice: z.number().min(0),
});

const RoomListResponseSchema = z.array(RoomListItemSchema);

const RoomDetailSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
  imageUrls: z.array(z.string()),
  dailyPrice: z.number().min(0),
  status: z.string(),
});
const RoomBookingHistorySchema = z.object({
  bookingRoomId: z.string(),
  bookingId: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  anyBreakfast: z.boolean(),
  breakfastDaysCount: z.number().min(0),
  note: z.string().optional().nullable(),
});

const RoomBookingHistoryResponseSchema = z.array(RoomBookingHistorySchema);

const EditRoomRequestSchema = z.object({
  roomName: z.string(),
  roomTypeId: z.string(),
  status: z.string(),
});
const UpdateRoomDetailRequestSchema = EditRoomRequestSchema;
const CreateRoomRequestSchema = EditRoomRequestSchema;

const UpdateRoomStatusResponseSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
  updatedAt: z.string(),
});

const CreateRoomResponseSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
  dailyPrice: z.number().min(0),
  status: z.string(),
  createdAt: z.string(),
});

const UpdateRoomDetailResponseSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
  dailyPrice: z.number().min(0),
  status: z.string(),
});
const RoomPaymentSchema = z.object({
  paymentMethod: PaymentMethodEnum.optional(),
  paidAmount: z.number().optional(),
  paymentNote: z.string().optional(),
});

const AvailableRoomItemSchema = z.object({
  roomTypeId: z.string(),
  roomTypeCode: z.string(),
  roomTypeName: z.string(),
  baseRatePerNight: z.number().min(0),
  maxOccupancy: z.number().min(0),
  totalRooms: z.number().min(0),
  availableCount: z.number().min(0),
  availableRooms: z.array(
    z.object({
      roomId: z.string(),
      roomName: z.string(),
      status: z.string(),
    })
  ),
});
const AvailableRoomsInternalResponseSchema = z.array(AvailableRoomItemSchema);

const useRoomSchema = () => {
  return {
    RoomTypeEnum,
    RoomStatusEnum,
    RoomDetailSchema,
    UpdateRoomStatusResponseSchema,
    RoomListResponseSchema,
    RoomListItemSchema,
    RoomBookingHistorySchema,
    RoomBookingHistoryResponseSchema,
    CreateRoomResponseSchema,
    UpdateRoomDetailResponseSchema,
    RoomPaymentSchema,
    EditRoomRequestSchema,
    UpdateRoomDetailRequestSchema,
    CreateRoomRequestSchema,
    AvailableRoomsInternalResponseSchema,
    AvailableRoomItemSchema,
  };
};
export default useRoomSchema;
