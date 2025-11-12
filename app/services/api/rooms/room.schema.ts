import z from "zod";
import { ROOM_TYPE } from "./room.types";
import { PaymentSchema } from "../../schema/payment.schema";

const RoomTypeEnum = z.enum(ROOM_TYPE, {
  error: "Loại phòng không hợp lệ",
});

const RoomStatusEnum = z.enum([
  "Ready",
  "Dirty",
  "Cleaning",
  "Maintenance",
  "OutOfService",
  "Locked",
]);

// -------------------------------

const RoomListItemSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  status: z.string(),
  roomTypeId: z.string(),
  roomTypeCode: z.string(),
  roomTypeName: z.string(),
  imageUrls: z.array(z.url()),
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

const BookingDetailRoomItemSchema = z.object({
  bookingRoomId: z.string(),
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});
export const RoomSchema = {
  RoomTypeEnum,
  RoomStatusEnum,
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListItemSchema,
  RoomBookingHistorySchema,
  RoomBookingHistoryResponseSchema,
  CreateRoomResponseSchema,
  UpdateRoomDetailResponseSchema,
  EditRoomRequestSchema,
  UpdateRoomDetailRequestSchema,
  CreateRoomRequestSchema,
  AvailableRoomsInternalResponseSchema,
  AvailableRoomItemSchema,
  RoomListResponseSchema,
  BookingDetailRoomItemSchema,
};
