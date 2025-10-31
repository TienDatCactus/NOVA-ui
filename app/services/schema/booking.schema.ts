import z from "zod";
import useRoomSchema from "./room.schema";
import useServiceSchema from "./service.schema";
import useInvoiceSchema from "./invoice.schema";
/* ------------------- */
const { RoomPaymentSchema } = useRoomSchema();
const { ServiceOrderSchema } = useServiceSchema();
const { InvoiceListResponseSchema, RoomInvoiceSchema, ServiceInvoiceSchema } =
  useInvoiceSchema();

/* ------------------- */

const BookingSourceEnum = z.enum(
  ["DirectStaff", "DirectCustomer", "OTA", "Agency"],
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
  checkinDate: z.union([
    z.date("Ngày nhận phòng không hợp lệ"),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày không hợp lệ",
    }),
  ]),
  checkoutDate: z.union([
    z.date("Ngày trả phòng không hợp lệ"),
    z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày không hợp lệ",
    }),
  ]),
  adultsAmount: z.number().int().min(1, "Phải có ít nhất 1 người lớn"),
  childrenAmount: z.number().int().min(0).default(0),
  isBreakfastAll: z.boolean().default(false),
  breakfastDates: z.array(z.date()).optional(),

  guestFullName: z
    .string()
    .min(2, "Tên khách không hợp lệ")
    .regex(/^[^\d]+$/, "Tên khách không được chứa số"),
  guestEmail: z.email("Email không hợp lệ").optional().or(z.literal("")),
  guestPhone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15)
    .optional()
    .or(z.literal("")),

  specialRequest: z.string().optional(),
  overridePrice: z.number().optional().nullable(),
  internalNote: z.string().optional().nullable(),

  roomPayment: RoomPaymentSchema.optional().nullable(),
  serviceOrder: ServiceOrderSchema.optional(),
});

const StaffCreateBookingResponseSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  bookingCode: z.string().min(1, "Mã đặt phòng không hợp lệ"),
  status: z.string().optional(),
  checkinDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, "Expected YYYY-MM-DD")
    .optional(),
  checkoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/i, "Expected YYYY-MM-DD")
    .optional(),
  totalAmount: z.number().min(0, "Tổng tiền không hợp lệ").optional(),
  roomInvoice: RoomInvoiceSchema.optional().nullable(),
  serviceInvoice: ServiceInvoiceSchema.optional().nullable(),
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
const BookingDetailItemSchema = z.object({
  id: z.string(),
  bookingCode: z.string(),
  source: z.string(),
  status: z.string(),
  checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  adults: z.number().int().nonnegative(),
  children: z.number().int().optional(),
  note: z.string().optional().nullable(),
  totalAmount: z.number(),
  paidAmount: z.number().optional().default(0),
  paymentStatus: z.string(),
  paymentMethod: z.string().optional().nullable(),
  customer: z.object({
    id: z.string(),
    fullName: z.string(),
    phoneNumber: z.string().optional().nullable(),
    email: z.email().optional().nullable(),
  }),
  rooms: z.array(
    z.object({
      roomId: z.string(),
      roomName: z.string(),
      roomTypeId: z.string(),
      roomTypeName: z.string(),
      fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
    })
  ),
  invoices: InvoiceListResponseSchema.optional(),
});

const BookingOTAItem = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  note: z.string(),
});
const BookingOTAResponseSchema = z.array(BookingOTAItem);

const useBookingSchema = () => {
  return {
    BookingListResponseSchema,
    BookingDetailItemSchema,
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
