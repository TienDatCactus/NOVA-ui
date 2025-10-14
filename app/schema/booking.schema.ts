import { formatDate } from "date-fns";
import z from "zod";
import { BOOKING_CHANNEL, ROOM_TYPE } from "~/lib/constants";

const RoomTypeEnum = z.enum(ROOM_TYPE, {
  error: "Loại phòng không hợp lệ",
});
const BookingChannelEnum = z.enum(BOOKING_CHANNEL, {
  error: "Kênh đặt phòng không hợp lệ",
});
const CustomerBookingInfoSchema = z
  .object({
    fullName: z
      .string({
        error: "Họ và tên không hợp lệ",
      })
      .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.email("Email không hợp lệ").optional(),
    phoneNumber: z
      .string({
        error: "Số điện thoại không hợp lệ",
      })
      .min(10, "Số điện thoại phải có ít nhất 10 ký tự")
      .optional(),
    bookingChannel: BookingChannelEnum,
    bookingCode: z.string().optional(),
    adults: z
      .number({
        error: "Thiếu số lượng ",
      })
      .int()
      .min(1, "Phải có ít nhất 1 người lớn"),
    children: z.number().int().optional(),
    checkIn: z
      .date({ error: "Ngày nhận phòng không hợp lệ" })
      .min(new Date(), "Ngày nhận phòng phải là ngày trong tương lai."),
    checkOut: z
      .date({ error: "Ngày trả phòng không hợp lệ" })
      .min(new Date(), "Ngày trả phòng phải là ngày trong tương lai."),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    error: "Ngày trả phòng phải sau ngày nhận phòng.",
    path: ["checkOut"],
  });

const SelectedRoomSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  price: z.number(),
  roomType: RoomTypeEnum,
  quantity: z.number().int().min(0, "Số lượng không thể âm."),
});

const RoomSchema = z.object({
  ...SelectedRoomSchema.shape,
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

const RoomSelectionSchema = z.object({
  rooms: z.array(SelectedRoomSchema, {
    error: "Phải chọn ít nhất 1 phòng.",
  }),
  selectedBreakfastDates: z.array(z.string()).optional(),
});

const BookingSchema = z
  .object({
    customerInfo: CustomerBookingInfoSchema,
    roomSelection: RoomSelectionSchema,
    services: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    const totalRooms = data.roomSelection.rooms.reduce(
      (sum, room) => sum + room.quantity,
      0
    );
    const selectedBreakfastDates =
      data.roomSelection.selectedBreakfastDates || [];

    if (totalRooms === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Phải chọn ít nhất 1 phòng.",
        path: ["roomSelection"],
      });
    }
    if (selectedBreakfastDates.length > 0 && totalRooms === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Phải chọn ít nhất 1 phòng để đặt bữa sáng.",
        path: ["selectedBreakfastDates"],
      });
    }
    selectedBreakfastDates.forEach((date) => {
      if (
        formatDate(date, "yyyy-MM-dd") <
          formatDate(data.customerInfo.checkIn, "yyyy-MM-dd") ||
        formatDate(date, "yyyy-MM-dd") >=
          formatDate(data.customerInfo.checkOut, "yyyy-MM-dd")
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Ngày ${formatDate(date, "yyyy-MM-dd")} không hợp lệ cho bữa sáng.`,
          path: ["selectedBreakfastDates"],
        });
      }
    });
  });

const useBookingSchema = () => {
  return {
    CustomerBookingInfoSchema,
    SelectedRoomSchema,
    RoomSelectionSchema,
    BookingSchema,
    RoomTypeEnum,
    BookingChannelEnum,
    RoomSchema,
  };
};
export default useBookingSchema;
