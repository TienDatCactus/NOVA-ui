import z from "zod";
import { PaymentSchema } from "../../schema/payment.schema";
import { InvoiceSchema } from "../invoices/invoice.schema";
import { OrderSchema } from "../orders/order.schema";
import { RoomSchema } from "../rooms/room.schema";

const BookingSourceEnum = z.enum(
  ["DirectStaff", "DirectCustomer", "OTA", "Agency", "RoomBlock"],
  "Nguồn đặt phòng không hợp lệ"
);

const BookingOperationTypeEnum = z.enum(
  ["Add", "Change", "Remove"],
  "Loại thao tác đặt phòng không hợp lệ"
);
const BookingStatusEnum = z.enum({
  Pending: 0,
  Confirmed: 1,
  CheckedIn: 2,
  InHouse: 3,
  CheckedOut: 4,
  Cancelled: 5,
});

const StaffCreateBookingSchema = z
  .object({
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
    serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
    roomPayment: PaymentSchema.RoomPaymentSchema.optional(),
  })
  .refine(
    (data) => {
      // Validate service order scheduledDates are within checkin-checkout range
      if (!data.serviceOrder?.services) return true;

      const checkinDate = new Date(data.checkinDate);
      const checkoutDate = new Date(data.checkoutDate);

      return data.serviceOrder.services.every((service) => {
        if (!service.scheduledDate) return true; // Optional field
        const scheduledDate = new Date(service.scheduledDate);
        return scheduledDate >= checkinDate && scheduledDate <= checkoutDate;
      });
    },
    {
      message:
        "Ngày thực hiện dịch vụ phải nằm trong khoảng thời gian lưu trú (từ ngày nhận phòng đến ngày trả phòng)",
      path: ["serviceOrder"],
    }
  );

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

const UpdateBookingRoomRequestSchema = z
  .object({
    action: BookingOperationTypeEnum,
    bookingRoomId: z.string().optional().nullable(), // Nullable for Add operation
    roomId: z.string().optional(), // For Add operation
    newRoomId: z.string().optional(), // For Change operation
    fromDate: z.string().optional(), // For Add operation (yyyy-MM-dd)
    toDate: z.string().optional(), // For Add operation (yyyy-MM-dd)
  })
  .refine(
    (data) => {
      // Add operation: requires roomId + fromDate + toDate
      if (data.action === "Add") {
        return !!(data.roomId && data.fromDate && data.toDate);
      }
      // Change operation: requires bookingRoomId + newRoomId
      if (data.action === "Change") {
        return !!(data.bookingRoomId && data.newRoomId);
      }
      // Remove operation: requires bookingRoomId only
      if (data.action === "Remove") {
        return !!data.bookingRoomId;
      }
      return false; // Invalid action
    },
    {
      message:
        "Invalid room operation: ADD requires roomId+fromDate+toDate, CHANGE requires bookingRoomId+newRoomId, REMOVE requires bookingRoomId",
    }
  );

const StaffUpdateBookingRequestSchema = z.object({
  checkinDate: z
    .union([
      z.date("Ngày nhận phòng không hợp lệ"),
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

  // ========== THÔNG TIN KHÁCH ==========
  adultsAmount: z.number().min(1, "Phải có ít nhất 1 người lớn").optional(),
  childrenAmount: z.number().min(0).optional(),

  // ========== GHI CHÚ ==========
  note: z.string().optional(),

  // ========== OTA ==========
  otaBookingCode: z.string().optional(),
  otaInformationId: z.string().optional(),

  // ========== KHÁCH HÀNG ==========
  customerId: z.string("Customer ID không hợp lệ").optional(),

  // ========== THANH TOÁN ==========
  totalAmount: z.number().min(0, "Tổng tiền không hợp lệ").optional(),
  breakfastDates: z
    .array(
      z.object({
        date: z.string().optional(),
      })
    )
    .optional(),
  // ========== PHÒNG (Array operations: ADD, CHANGE, REMOVE) ==========
  rooms: z.array(UpdateBookingRoomRequestSchema).optional(),
});

const StaffUpdateBookingResponseSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  bookingCode: z.string("Booking Code không hợp lệ"),
});

const BookingPendingChargesResponseSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  roomInvoice: z
    .object({
      invoiceId: z.string().optional().nullable(),
      invoiceNo: z.string().optional().nullable(),
      total: z.number(),
      paid: z.number(),
      balance: z.number(),
    })
    .optional()
    .nullable(),
  pendingOrders: z.object({
    posOrders: z.array(
      z.object({
        id: z.string(),
        status: z.string(),
        totalAmount: z.number(),
        customerId: z.string().optional().nullable(),
        createdAt: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            menuItemId: z.string(),
            itemName: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            servedAt: z.string().optional().nullable(),
            subtotal: z.number(),
          })
        ),
      })
    ),
    serviceOrders: z.array(
      z.object({
        id: z.string(),
        bookingId: z.string(),
        serviceItemId: z.string(),
        serviceName: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        scheduledAt: z.string(),
        performedAt: z.string().optional().nullable(),
        status: z.string(),
        subtotal: z.number(),
      })
    ),
  }),
  paidOrders: z.array(
    z.object({
      invoiceId: z.string(),
      invoiceNo: z.string(),
      orderType: z.string(),
      orderId: z.string(),
      total: z.number(),
      paidAt: z.string(),
    })
  ),
  summary: z.object({
    roomBalance: z.number(),
    pendingCharges: z.number(),
    totalDue: z.number(),
  }),
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
  serviceOrders:
    OrderSchema.ServiceOrderListByBookingDetailSchema.optional().nullable(),
  posOrders: OrderSchema.POSOrderListByBookingResponseSchema.optional(),
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

// Common payment item schema
const CheckoutPaymentItemSchema = z.object({
  method: PaymentSchema.PaymentMethodEnum,
  amount: z.number().min(0, "Số tiền không hợp lệ"),
  transactionReference: z
    .string()
    .min(1, "Mã giao dịch không hợp lệ")
    .optional()
    .nullable(),
});

const StaffCreateCheckoutInvoiceResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  subTotal: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  balance: z.number(),
  status: z.string(),
  paymentMethod: z.string(),
  issuedAt: z.string(),
  itemCount: z.number(),
});

// Yêu cầu thanh toán khi checkout (phòng + tổng thể)
const StaffCheckoutPaymentRequestSchema = CheckoutPaymentItemSchema;

// Yêu cầu checkout 1 booking
const StaffCheckoutRequestSchema = z.object({
  actualCheckoutTime: z
    .union([
      z.date("Thời gian trả phòng thực tế không hợp lệ"),
      z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Thời gian trả phòng thực tế không hợp lệ",
      }),
    ])
    .optional(),
  notes: z.string().optional().nullable(),
});

// Yêu cầu checkout nhiều booking cùng lúc
const StaffCheckoutMultipleRequestSchema = z.object({
  bookingIds: z
    .array(z.string("Booking ID không hợp lệ"))
    .min(1, "Phải chọn ít nhất 1 booking"),
  paymentMethod: PaymentSchema.PaymentMethodEnum.optional(),
  paidAmount: z.number().min(0, "Số tiền thanh toán không hợp lệ").optional(),
  transactionReference: z
    .string()
    .min(1, "Mã giao dịch không hợp lệ")
    .optional()
    .nullable(),
});

// Response cho add-completed-charges
const StaffAddCompletedChargesRequestSchema = z.object({
  posItems: z
    .array(
      z.object({
        menuItemId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .optional(),
  serviceItems: z
    .array(
      z.object({
        serviceItemId: z.string(),
        quantity: z.number().min(0),
      })
    )
    .optional(),
  bookingRoomId: z.string().optional(),
  source: z.string().optional(),
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

const AvailableRoomsForChangeResponseSchema = z.array(
  AvailableRoomForChangeSchema
);
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
  UpdateBookingRoomRequestSchema,
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  AvailableRoomsForChangeResponseSchema,
  BookingPendingChargesResponseSchema,
  StaffCheckoutRequestSchema,
  StaffCheckoutMultipleRequestSchema,
  StaffAddCompletedChargesRequestSchema,
  StaffCreateCheckoutInvoiceResponseSchema,
  StaffCheckoutPaymentRequestSchema,
};
