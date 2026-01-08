import z from "zod";
import { PaymentSchema } from "../payments/payments.schema";
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
const BookingStatusEnum = z.enum([
  "Pending",
  "Confirmed",
  "CheckedIn",
  "InHouse",
  "CheckedOut",
  "Cancelled",
]);

const StaffCreateBookingSchema = z
  .object({
    source: BookingSourceEnum,
    otaInformationId: z.string("Mã thông tin OTA không hợp lệ").optional(),
    otaBookingCode: z.string("Mã OTA booking không hợp lệ").optional(),
    roomIds: z.array(z.string("Mã phòng không hợp lệ")).optional(),
    roomTypeRequests: z
      .array(
        z.object({
          roomTypeId: z.string("Mã loại phòng không hợp lệ"),
          quantity: z.number("Số lượng không hợp lệ").int().min(0),
        })
      )
      .optional(),
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
    adultsAmount: z
      .number("Số lượng người lớn không hợp lệ")
      .int()
      .min(1, "Phải có ít nhất 1 người lớn"),
    childrenAmount: z
      .number("Số lượng trẻ em không hợp lệ")
      .int()
      .min(0)
      .default(0),
    includeBreakfast: z
      .boolean("Thông tin bữa sáng không hợp lệ")
      .default(false),

    guestFullName: z
      .string()
      .min(2, "Tên khách không hợp lệ")
      .regex(/^[^\d]+$/, "Tên khách không được chứa số"),
    guestEmail: z.email("Email không hợp lệ").optional().or(z.literal("")),
    guestPhone: z
      .string("Số điện thoại không hợp lệ")
      .optional()
      .or(z.literal("")), // cho phép empty
    // .refine(
    //   (val) =>
    //     val === "" || /^((\+84|84|0)(3|5|7|8|9)[0-9]{8})$/.test(val || ""),
    //   "Số điện thoại không hợp lệ"
    // ), // this only
    specialRequest: z.string().optional(),
    overridePrice: z
      .number()
      .max(9999999999, "Giá vượt quá giới hạn")
      .optional()
      .nullable(),
    internalNote: z.string().optional().nullable(),
    serviceOrder: OrderSchema.ServiceOrderSchema.optional(),
    roomPayment: PaymentSchema.RoomPaymentSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.serviceOrder?.services) return true;

      const checkinDate = new Date(data.checkinDate);
      const checkoutDate = new Date(data.checkoutDate);

      return data.serviceOrder.services.every((service) => {
        if (!service.scheduledDate) return false;
        const scheduledDate = new Date(service.scheduledDate);
        return scheduledDate >= checkinDate && scheduledDate <= checkoutDate;
      });
    },
    {
      message: "Ngày thực hiện dịch vụ phải nằm trong khoảng thời gian lưu trú",
      path: ["serviceOrder"],
    }
  )
  .refine(
    (data) => {
      // OTA booking requires otaInformationId and otaBookingCode
      if (data.source === "OTA") {
        return !!data.otaInformationId && !!data.otaBookingCode;
      }
      return true;
    },
    {
      message: "Booking OTA phải có kênh OTA và mã booking OTA",
      path: ["otaInformationId"],
    }
  )
  .refine(
    (data) => {
      if (data.source === "OTA") {
        return !!data.guestEmail && data.guestEmail.length > 0;
      }
      return true;
    },
    {
      message: "Booking OTA phải có email khách hàng để xác nhận",
      path: ["guestEmail"],
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
  includeBreakfast: z.boolean().default(false),
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
    isFreeChange: z.boolean().optional(), // For Change operation - indicates complimentary upgrade/change
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
  totalAmount: z
    .number("Giá trị không hợp lệ")
    .min(0, "Tổng tiền không hợp lệ")
    .optional(),
  includeBreakfast: z.boolean("Thông tin bữa sáng không hợp lệ").optional(),
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
  paymentUrl: z.string().optional().nullable(),
  paymentProvider: z.string().optional().nullable(),
  requiresPaymentAction: z.boolean().optional().nullable(),
});
const BookingListItemSchema = z.object({
  bookingId: z.string().optional(),
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
        status: BookingStatusEnum,
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
  source: BookingSourceEnum,
  status: BookingStatusEnum,
  checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  adults: z.number().int().nonnegative(),
  children: z.number().int().optional(),
  note: z.string().optional().nullable(),
  totalAmount: z.number(),
  totalRoomCharge: z.number().optional().default(0),
  totalBreakfast: z.number().optional().default(0),
  paidAmount: z.number().optional().default(0),
  invoiceStatus: InvoiceSchema.InvoiceStatusEnum.optional().nullable(),
  paymentMethod: PaymentSchema.PaymentMethodEnum.optional().nullable(),
  otaName: z.string().optional().nullable(),
  includeBreakfast: z.boolean().optional(),
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
  amount: z.number("Vui lòng nhập số tiền").min(0.01, "Số tiền phải lớn hơn 0"),

  method: z.string().min(1, "Vui lòng chọn phương thức thanh toán"),
  transactionReference: z.string().optional().nullable(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  description: z.string().optional(),
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

// Response for checkout payment (with gateway redirect support)
const StaffCheckoutPaymentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  // Payment gateway redirect fields
  paymentUrl: z.string().optional(),
  requiresPaymentAction: z.boolean().optional(),
  paymentProvider: z.string().optional(),
});

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

const UpdateBookingStatusRequestSchema = z.object({
  bookingId: z.string("Booking ID không hợp lệ"),
  newStatus: BookingStatusEnum,
});
const UpdateBookingStatusResponseSchema = z.object({
  bookingId: z.string(),
  bookingCode: z.string().optional(),
  oldStatus: BookingStatusEnum,
  newStatus: BookingStatusEnum,
  updatedAt: z.string().optional(),
});

const ConfirmBookingPaymentRequestSchema = z.object({
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  paidAmount: z.number().min(0, "Số tiền thanh toán không hợp lệ"),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  description: z.string().optional(),
});
const ConfirmBookingPaymentResponseSchema = z.object({
  bookingId: z.string().optional(),
  invoiceId: z.string().optional(),
  invoiceNo: z.string().optional(),
  paymentId: z.string().optional().nullable(),
  paidAmount: z.number().optional(),
  invoiceTotal: z.number().optional(),
  remainingAmount: z.number().optional(),
  invoiceStatus: z.string().optional(),
  message: z.string().optional(),
  // Payment redirect fields
  paymentUrl: z.string().optional().nullable(),
  requiresPaymentAction: z.boolean().default(false),
  paymentProvider: z.string().optional().nullable(),
});

const OrderableBookingResponseSchema = z.object({
  activeBookings: z.array(
    z.object({
      bookingId: z.string(),
      bookingCode: z.string(),
      customerName: z.string(),
      status: z.string(),
      checkinDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      checkoutDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      rooms: z.array(
        z.object({
          bookingRoomId: z.string(),
          roomId: z.string(),
          roomName: z.string(),
          roomTypeName: z.string(),
        })
      ),
      hasUnpaidCheckoutInvoice: z.boolean(),
      checkoutInvoiceBalance: z.number().optional().nullable(),
    })
  ),

  confirmedBookings: z.array(
    z.object({
      bookingId: z.string(),
      bookingCode: z.string(),
      customerName: z.string(),
      checkinDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      checkoutDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
      rooms: z.array(
        z.object({
          bookingRoomId: z.string(),
          roomId: z.string(),
          roomName: z.string(),
          roomTypeName: z.string(),
        })
      ),
    })
  ),
});

const BookingPayForRoomRequestSchema = z.object({
  bookingRoomIds: z
    .array(z.string())
    .min(1, "Phải chọn ít nhất 1 phòng để thanh toán"),
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  paidAmount: z.number().min(0.01, "Số tiền thanh toán không hợp lệ"),
  transactionReference: z.string().optional(),
});

const UnpaidRoomSchema = z.object({
  bookingRoomId: z.string(),
  roomId: z.string(),
  roomName: z.string(),
  roomTypeName: z.string(),
  totalCharge: z.number(),
  roomCharge: z.number(),
  breakfastCharge: z.number(),
  nights: z.number(),
  checkinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});

const UnpaidRoomsForBookingSchema = z.object({
  bookingId: z.string(),
  bookingCode: z.string(),
  unpaidRooms: z.array(UnpaidRoomSchema),
  totalUnpaidAmount: z.number().min(0),
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
  UpdateBookingRoomRequestSchema,
  BookingPendingChargesResponseSchema,

  //! staff operations
  StaffBookingPricePreviewRequestSchema,
  StaffBookingPricePreviewResponseSchema,
  StaffUpdateBookingRequestSchema,
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  AvailableRoomsForChangeResponseSchema,
  BookingPayForRoomRequestSchema,

  //! checkout booking
  StaffCheckoutRequestSchema,
  StaffCheckoutMultipleRequestSchema,
  StaffAddCompletedChargesRequestSchema,
  StaffCreateCheckoutInvoiceResponseSchema,
  StaffCheckoutPaymentRequestSchema,
  StaffCheckoutPaymentResponseSchema,

  //! update booking status
  UpdateBookingStatusRequestSchema,
  UpdateBookingStatusResponseSchema,

  //! confirm booking payment
  ConfirmBookingPaymentRequestSchema,
  ConfirmBookingPaymentResponseSchema,

  //! orderable bookings (for POS/Service order creation)
  OrderableBookingResponseSchema,

  UnpaidRoomsForBookingSchema,
  UnpaidRoomSchema,
};
