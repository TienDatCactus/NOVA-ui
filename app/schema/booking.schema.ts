import z from "zod";
import { BOOKING_CHANNEL, ROOM_TYPE } from "~/lib/constants";

const RoomTypeEnum = z.enum(ROOM_TYPE);
const BookingChannelEnum = z.enum(BOOKING_CHANNEL);
const CustomerBookingInfoSchema = z
  .object({
    fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.email("Email không hợp lệ").optional(),
    phoneNumber: z
      .string()
      .min(10, "Số điện thoại phải có ít nhất 10 ký tự")
      .optional(),
    bookingChannel: BookingChannelEnum,
    bookingCode: z.string().optional(),
    adults: z.number().int().min(1, "Phải có ít nhất 1 người lớn"),
    children: z.number().int().optional(),
    checkIn: z
      .date()
      .min(new Date(), "Ngày nhận phòng phải là ngày trong tương lai."),
    checkOut: z
      .date()
      .min(new Date(), "Ngày trả phòng phải là ngày trong tương lai."),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Ngày trả phòng phải sau ngày nhận phòng.",
  });

const RoomChoiceSchema = z.object({
  numberOfRooms: z
    .number()
    .int()
    .positive({ message: "Số lượng phòng phải lớn hơn 0." }),
  roomType: RoomTypeEnum,
});

const useBookingSchema = () => {
  return {
    CustomerBookingInfoSchema,
    RoomChoiceSchema,
    RoomTypeEnum,
    BookingChannelEnum,
  };
};
export default useBookingSchema;
