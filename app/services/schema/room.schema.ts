import z from "zod";
import { ROOM_TYPE } from "~/lib/constants";

const RoomTypeEnum = z.enum(ROOM_TYPE, {
  error: "Loại phòng không hợp lệ",
});
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

const RoomDetailSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  status: z.string(),
  locked: z.boolean(),
  roomTypeId: z.string(),
  roomTypeCode: z.string(),
  roomTypeName: z.string(),
  dailyPrice: z.number().nonnegative(),
  isOccupiedToday: z.boolean(),
  currentFrom: z.string(),
  currentTo: z.string(),
  hasBreakfastToday: z.boolean(),
  recentBookings: z.array(
    z.object({
      bookingRoomId: z.string(),
      bookingId: z.string(),
      fromDate: z.string(),
      toDate: z.string(),
      anyBreakfast: z.boolean(),
      breakfastDaysCount: z.number().int().min(0),
      note: z.string().optional(),
    })
  ),
});
const UpdateRoomStatusResponseSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
  updatedAt: z.string(),
});
const useRoomSchema = () => {
  return {
    RoomItemSchema,
    RoomSelectionSchema,
    RoomSchema,
    RoomTypeEnum,
    RoomDetailSchema,
    UpdateRoomStatusResponseSchema,
  };
};
export default useRoomSchema;
