import z from "zod";
import { PaymentSchema } from "../../schema/payment.schema";
import { InvoiceSchema } from "../invoices/invoice.schema";
import { OrderSchema } from "../orders/order.schema";
import { RoomSchema } from "../rooms/room.schema";

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

const StaffCreateBookingSchema = z.object({
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
  overridePrice: z
    .number()
    .max(9999999999, "Giá vượt quá giới hạn")
    .optional()
    .nullable(),
  internalNote: z.string().optional().nullable(),

  roomPayment: PaymentSchema.RoomPaymentSchema.optional().nullable(),
  serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
});

const StaffBookingPricePreviewRequestSchema = z.object({
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
  adultsAmount: z.number(),
  childrenAmount: z.number(),
  roomTypes: z.array(
    z.object({
      roomTypeId: z.string(),
      quantity: z.number(),
    })
  ),
  isBreakfastAll: z.boolean().default(false),
  breakfastDates: z.array(z.string()).optional(),
  services: z.array(
    z.object({
      itemType: z.string(),
      itemId: z.string(),
      quantity: z.number(),
      scheduledDate: z.string(),
      note: z.string(),
    })
  ),
});

const StaffBookingPricePreviewResponseSchema = z.object({
  checkinDate: z.string(),
  checkoutDate: z.string(),
  nights: z.number(),
  adultsAmount: z.number(),
  childrenAmount: z.number(),
  rooms: z.array(
    z.object({
      roomTypeId: z.string(),
      roomTypeCode: z.string(),
      roomTypeName: z.string(),
      quantity: z.number(),
      ratePerNight: z.number(),
      nights: z.number(),
      subtotal: z.number(),
    })
  ),
  breakfast: z
    .object({
      days: z.number(),
      eligibleGuests: z.number(),
      total: z.number(),
    })
    .nullable(),
  services: z.any().nullable(),
  roomsSubtotal: z.number(),
  breakfastSubtotal: z.number(),
  servicesSubtotal: z.number(),
  total: z.number(),
  availablePaymentMethods: z.array(z.any()),
});

const StaffUpdateBookingRequestSchema = z.object({
  checkinDate: z
    .union([
      z.date("Ngày trả phòng không hợp lệ"),
      z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày không hợp lệ",
      }),
    ])
    .optional(),
  checkoutDate: z
    .union([
      z.date("Ngày trả phòng không hợp lệ"),
      z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày không hợp lệ",
      }),
    ])
    .optional(),
  adultsAmount: z.number().min(1, "Phải có ít nhất 1 người lớn").optional(),
  childrenAmount: z.number().min(0).optional(),
  note: z.string().optional(),
  otaBookingCode: z.string().optional(),
  otaInformationId: z.string().optional(),
  customerId: z.string("Customer ID không hợp lệ").optional(),
  paymentMethod: PaymentSchema.PaymentMethodEnum.optional(),
  paymentStatus: PaymentSchema.PaymentStatusEnum.optional(),
  totalAmount: z.number().min(0, "Tổng tiền không hợp lệ").optional(),
  paidAmount: z.number().min(0, "Số tiền thanh toán không hợp lệ").optional(),
  rooms: z
    .array(
      z.object({
        roomId: z.string("Room ID không hợp lệ").optional(),
        fromDate: z.string("Ngày bắt đầu không hợp lệ").optional(),
        toDate: z.string("Ngày kết thúc không hợp lệ").optional(),
        remove: z.boolean().default(false).optional(),
      })
    )
    .optional(),
});

const StaffUpdateBookingResponseSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  bookingCode: z.string("Booking Code không hợp lệ"),
});

const StaffCancelBookingResponseSchema = StaffUpdateBookingResponseSchema;
/* ----------------------------------- */
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
  roomInvoice: InvoiceSchema.RoomInvoiceSchema.optional().nullable(),
  serviceInvoice: InvoiceSchema.ServiceInvoiceSchema.optional().nullable(),
});
const BookingListItemSchema = z.object({
  bookingCode: z.string().optional(),
  customerName: z.string().optional(),
  checkinDate: z.string().optional(),
  checkoutDate: z.string().optional(),
  source: z.string().optional(),
  otaName: z.string().optional().nullable(),
  status: z.string().optional(),
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
  invoiceStatus: InvoiceSchema.InvoiceStatusEnum.optional().nullable(),
  paymentMethod: PaymentSchema.PaymentMethodEnum.optional().nullable(),
  otaName: z.string().optional().nullable(),
  customer: z.object({
    id: z.string(),
    fullName: z.string(),
    phoneNumber: z.string().optional().nullable(),
    email: z.email().optional().nullable(),
  }),
  rooms: z.array(RoomSchema.BookingDetailRoomItemSchema),
  invoices: InvoiceSchema.InvoiceListResponseSchema.optional(),
});

const BookingOTAItem = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  note: z.string(),
});
const BookingOTAResponseSchema = z.array(BookingOTAItem);

const StaffChangeRoomRequestSchema = z.object({
  rooms: z.array(
    z.object({
      bookingRoomId: z.string("Booking Room ID không hợp lệ"),
      newRoomId: z.string("New Room ID không hợp lệ"),
    })
  ),
});

const StaffChangeRoomResponseSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  bookingCode: z.string("Booking Code không hợp lệ"),
});

const AvailableRoomForChangeSchema = z.object({
  roomId: z.string(),
  roomName: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string(),
  baseRate: z.number(),
  availabilityStatus: z.string(),
  isSameRoomType: z.boolean(),
  conflictInfo: z
    .object({
      bookingCode: z.string(),
      status: z.string(),
      customerName: z.string().nullable(),
      checkinDate: z.string(),
      checkoutDate: z.string(),
      message: z.string(),
    })
    .nullable(),
});

const AvailableRoomsForChangeResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number().optional(),
  message: z.string(),
  data: z.array(AvailableRoomForChangeSchema),
});

export const BookingSchema = {
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
  StaffBookingPricePreviewRequestSchema,
  StaffBookingPricePreviewResponseSchema,
  StaffUpdateBookingRequestSchema,
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  AvailableRoomsForChangeResponseSchema,
};
