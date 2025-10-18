import z from "zod";
import { BOOKING_CHANNEL, ROOM_TYPE } from "~/lib/constants";
import useRoomSchema from "./room.schema";
import useServiceSchema from "./service.schema";
/* ------------------- */
const { RoomItemSchema, RoomSelectionSchema } = useRoomSchema();
const { ServiceItemSchema, ServicesSchema, ServiceCategoryEnum } =
  useServiceSchema();
/* ------------------- */

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
    email: z.email("Email không hợp lệ").optional().or(z.literal("")),
    city: z.string().optional(),
    country: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    state: z.string().optional(),
    postCode: z.string().optional(),
    howDidYouHearAboutUs: z.string().optional(),
    phoneNumber: z
      .string({
        error: "Số điện thoại không hợp lệ",
      })
      .min(10, "Số điện thoại phải có ít nhất 10 ký tự")
      .optional()
      .or(z.literal("")),
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
      .date("Ngày nhận phòng không hợp lệ")
      .min(new Date(), "Ngày nhận phòng phải là ngày trong tương lai."),
    checkOut: z
      .date("Ngày trả phòng không hợp lệ")
      .min(new Date(), "Ngày trả phòng phải là ngày trong tương lai."),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    error: "Ngày trả phòng phải sau ngày nhận phòng.",
    path: ["checkOut"],
  });

const BookingSchema = z
  .object({
    customerInfo: CustomerBookingInfoSchema,
    roomSelection: RoomSelectionSchema,
    services: z.array(ServiceItemSchema).optional(),
    note: z.string().optional(),
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
  });

const BookingItemSchema = z.object({
  id: z.string(),
  bookingCode: z.string().optional(),
  status: z.string(),
  checkinDate: z.string(),
  checkoutDate: z.string(),
  createdAt: z.string(),
  note: z.string().optional(),
  source: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  adults: z.number().int().min(0),
  children: z.number().int().min(0).optional(),
  totalAmount: z.number().min(0),
  paidAmount: z.number().min(0),
  paymentStatus: z.string().optional(),
  rooms: z.array(RoomItemSchema).optional(),
  services: ServicesSchema.optional(),
});

const BookingListResponseSchema = z.array(BookingItemSchema).optional();

const BookingItemByWeekSchema = z.object({
  roomId: z.string("roomId phải là string hợp lệ"),
  roomName: z.string().min(1, "roomName không được để trống"),
  roomTypeId: z.string("roomTypeId phải là string hợp lệ"),
  roomTypeName: z.string().min(1, "roomTypeName không được để trống"),
  bookings: z
    .array(
      z.object({
        bookingId: z.string("bookingId phải là string hợp lệ"),
        bookingCode: z.string(),
        status: z.enum([
          "Confirmed",
          "CheckedIn",
          "Cancelled",
          "Pending",
          "CheckedOut",
        ]),
        checkinDate: z.string(),
        checkoutDate: z.string(),
        segmentFrom: z.string(),
        segmentTo: z.string(),
      })
    )
    .default([])
    .describe("Danh sách các booking thuộc phòng này"),
});

const BookingListByWeekResponseSchema = z.array(BookingItemByWeekSchema);

/* schema for external booking creation */
const ExternalCreateBookingSchema = z.object({
  customerId: z.string().optional(),
  newCustomer: CustomerBookingInfoSchema.optional(),
  checkinDate: z.date(),
  checkoutDate: z.date(),
  adultsAmount: z.number().int().min(0, "Số người lớn không hợp lệ"),
  childrenAmount: z.number().int().min(0, "Số trẻ em không hợp lệ"),
  isBreakfastAll: z.boolean(),
  breakfastDates: z.array(z.string()).optional(),
  note: z.string().optional(),
  source: z.string().optional(),
  otaName: z.string().optional(),
  otaCode: z.string().optional(),
  roomTypeRequests: z
    .array(
      z.object({
        roomTypeId: z.string({ message: "roomTypeId không hợp lệ" }),
        quantity: z
          .number()
          .int()
          .min(1, "Phải đặt ít nhất 1 phòng")
          .max(10, "Không thể đặt quá 10 phòng"),
      })
    )
    .min(1, "Phải có ít nhất 1 loại phòng được chọn"),
});

const ExternalBookingResponseSchema = z.object({
  bookingId: z.string("bookingId phải là string hợp lệ"),
  bookingCode: z.string().min(1, "bookingCode không được để trống"),
  status: z.string().min(1, "Trạng thái không được để trống"),
  totalAmount: z.number().min(0, "Tổng tiền phải >= 0"),
});

const useBookingSchema = () => {
  return {
    CustomerBookingInfoSchema,
    BookingSchema,
    BookingChannelEnum,
    BookingListResponseSchema,
    BookingItemSchema,
    ExternalCreateBookingSchema,
    ExternalBookingResponseSchema,
    BookingListByWeekResponseSchema,
    BookingItemByWeekSchema,
  };
};
export default useBookingSchema;
