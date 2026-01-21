import z from "zod";
import { ROOM_TYPE } from "./room.types";

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
  roomName: z.string("Tên phòng là bắt buộc").min(1, "Tên phòng là bắt buộc"),
  roomTypeId: z
    .string("Loại phòng là bắt buộc")
    .min(1, "Loại phòng là bắt buộc"),
  status: z
    .string("Trạng thái phòng là bắt buộc")
    .min(1, "Trạng thái phòng là bắt buộc"),
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
  roomTypeName: z.string().optional().nullable(),
  baseRatePerNight: z.number().min(0),
  totalRooms: z.number().min(0),
  availableRooms: z.number().min(0),
  totalPrice: z.number().min(0),
  nights: z.number().min(0),
  maxOccupancy: z.number().min(0),
  canAccommodate: z.boolean(),
  restrictionReason: z.string().optional().nullable(),
});

const AvailableRoomWithDetailItemSchema = z.object({
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
    }),
  ),
});

const AvailableRoomsResponseSchema = z.array(AvailableRoomItemSchema);

const AvailableRoomsWithDetailResponseSchema = z.array(
  AvailableRoomWithDetailItemSchema,
);

const BookingDetailRoomItemSchema = z.object({
  bookingRoomId: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  roomName: z.string().optional().nullable(),
  roomTypeId: z.string().optional().nullable(),
  roomTypeName: z.string().optional().nullable(),
  roomTypeNameEn: z.string().optional().nullable(),
  checkinDate: z.string().optional().nullable(),
  checkoutDate: z.string().optional().nullable(),
  nights: z.number().optional().nullable(),
  baseRate: z.number().optional().nullable(),
  roomCharge: z.number().optional().nullable(),
  breakfastCharge: z.number().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
  totalCharge: z.number().optional().nullable(),
  paidAmount: z.number().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

// QR Code Response (base64 image or URL)
const QRCodeResponseSchema = z.union([
  z.string(), // base64 data URL or image URL
  z.object({
    qrCodeUrl: z.string(),
    dataUrl: z.string().optional(),
  }),
]);

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
  AvailableRoomsResponseSchema,
  AvailableRoomsWithDetailResponseSchema,
  AvailableRoomItemSchema,
  RoomListResponseSchema,
  BookingDetailRoomItemSchema,
  QRCodeResponseSchema,
};
