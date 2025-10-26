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

const SelectedRoomSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  price: z.number().min(0, "Giá không hợp lệ"),
  roomType: RoomTypeEnum,
  quantity: z
    .number()
    .int()
    .min(0, "Số lượng không thể âm.")
    .max(10, "Không thể đặt quá 10 phòng."),
});
const RoomSchema = SelectedRoomSchema.extend({
  description: z.string().optional(),
  images: z.array(z.url()).optional(),
});

const RoomSelectionSchema = z
  .object({
    rooms: z
      .array(SelectedRoomSchema)
      .min(1, "Phải chọn ít nhất 1 phòng.")
      .refine(
        (rooms) => rooms.some((r) => r.quantity > 0),
        "Cần chọn ít nhất 1 phòng có số lượng lớn hơn 0."
      ),
    selectedBreakfastDates: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      !data.selectedBreakfastDates || data.selectedBreakfastDates.length <= 30,
    "Không thể chọn bữa sáng quá 30 ngày."
  );
const RoomItemSchema = z.object({
  roomId: z.string(),
  roomName: z.string().optional(),
  roomTypeId: z.string().optional(),
  roomTypeName: z.string().optional(),
  nightlyPrice: z.number("nightlyPrice phải là number").min(0),
});

const RoomListItemSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  locked: z.boolean(),
  status: z.string(),
  roomTypeId: z.string(),
  roomTypeCode: z.string(),
  roomTypeName: z.string(),
  dailyPrice: z.number(),
  isOccupied: z.boolean(),
});

const RoomListResponseSchema = z.array(RoomListItemSchema);

const RoomDetailSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
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
  paymentMethod: PaymentMethodEnum,
  paidAmount: z.number().min(0),
  paymentNote: z.string().optional(),
});
const useRoomSchema = () => {
  return {
    RoomItemSchema,
    RoomSelectionSchema,
    RoomSchema,
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
  };
};
export default useRoomSchema;
