import z from "zod";
import useRoomSchema from "./room.schema";
import useServiceSchema from "./service.schema";
import useInvoiceSchema from "./invoice.schema";
/* ------------------- */
const { RoomPaymentSchema } = useRoomSchema();
const { ServiceOrderSchema } = useServiceSchema();
const { InvoiceSchema } = useInvoiceSchema();

/* ------------------- */

const BookingSourceEnum = z.enum(
  {
    DirectStaff: 0,
    DirectCustomer: 1,
    OTA: 2,
    Agency: 3,
  },
  "Nguồn đặt phòng không hợp lệ"
);

const BookingStatusEnum = z.enum({
  Pending: 0,
  Confirmed: 1,
  CheckedIn: 2,
  InHouse: 3,
  CheckedOut: 4,
  Cancelled: 5,
});

export const StaffCreateBookingSchema = z.object({
  source: BookingSourceEnum,
  otaInformationId: z.string().optional(),
  otaBookingCode: z.string().optional(),
  roomIds: z.array(z.string()).min(1, "Phải chọn ít nhất 1 phòng cụ thể"),
  checkinDate: z.date("Ngày nhận phòng không hợp lệ"),
  checkoutDate: z.date("Ngày trả phòng không hợp lệ"),
  adultsAmount: z.number().int().min(1, "Phải có ít nhất 1 người lớn"),
  childrenAmount: z.number().int().min(0).default(0),
  isBreakfastAll: z.boolean().default(false),
  breakfastDates: z.array(z.date()).optional(),

  guestFullName: z.string().min(2, "Tên khách không hợp lệ"),
  guestEmail: z.email("Email không hợp lệ").optional().or(z.literal("")),
  guestPhone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15)
    .optional()
    .or(z.literal("")),

  specialRequest: z.string().optional(),
  overridePrice: z.number().min(0).optional(),
  internalNote: z.string().optional(),

  roomPayment: RoomPaymentSchema.optional(),
  serviceOrder: ServiceOrderSchema.optional(),
});

const StaffCreateBookingResponseSchema = z.object({
  bookingId: z.string().uuid("Booking ID không hợp lệ"),
  bookingCode: z.string().min(1, "Mã đặt phòng không hợp lệ"),
  status: z.string(),
  checkinDate: z.string().date("Ngày nhận phòng không hợp lệ"),
  checkoutDate: z.string().date("Ngày trả phòng không hợp lệ"),
  totalAmount: z.number().min(0, "Tổng tiền không hợp lệ"),
  roomInvoice: InvoiceSchema.optional(),
  serviceInvoice: InvoiceSchema.optional(),
});
const BookingListItemSchema = z.object({
  bookingCode: z.string().min(1, "bookingCode không được để trống"),
  customerName: z.string().min(1, "customerName không được để trống"),
  checkinDate: z.string().min(1, "checkinDate không được để trống"),
  checkoutDate: z.string().min(1, "checkoutDate không được để trống"),
  source: z.string().min(1, "source không được để trống"),
  status: z.string(),
});
const BookingListResponseSchema = z.array(BookingListItemSchema).optional();

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
const BookingItemSchema = z
  .object({
    id: z.string(),
    bookingCode: z.string(),
    source: z.string(),
    status: z.string(),
    checkinDate: z.string(),
    checkoutDate: z.string(),
    adults: z.number().int().nonnegative(),
    children: z.number().int().nonnegative(),
    note: z.string(),
    totalAmount: z.number(),
    paidAmount: z.number(),
    paymentStatus: z.string(),
    paymentMethod: z.string().nullable(),
    customer: z.object({
      id: z.string(),
      fullName: z.string(),
      phoneNumber: z.string(),
      email: z.email(),
    }),
    rooms: z.array(
      z.object({
        roomId: z.string(),
        roomName: z.string(),
        roomTypeId: z.string(),
        roomTypeName: z.string(),
        fromDate: z.string(),
        toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      })
    ),
    invoices: z.array(z.any()),
  })
  .strict();

const BookingOTAResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  note: z.string(),
});

const useBookingSchema = () => {
  return {
    BookingListResponseSchema,
    BookingItemSchema,
    BookingListByWeekResponseSchema,
    BookingItemByWeekSchema,
    BookingListItemSchema,
    StaffCreateBookingSchema,
    StaffCreateBookingResponseSchema,
    BookingOTAResponseSchema,
    BookingSourceEnum,
    BookingStatusEnum,
  };
};
export default useBookingSchema;
