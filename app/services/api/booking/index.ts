import http from "~/lib/http";

import { toYMD } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { BookingListParams } from "~/services/api/booking/booking.types";
import { Booking, OTAInformation } from "../../url";
import type {
  AvailableRoomsForChangeResponseDto,
  BookingDetailResponseDto,
  BookingListByWeekResponseDto,
  BookingListResponseDto,
  BookingOTAResponseDto,
  BookingPayForRoomRequestDto,
  BookingPendingChargesResponseDto,
  BookingUpgradeRoomRequestDto,
  ConfirmBookingPaymentRequestDto,
  ConfirmBookingPaymentResponseDto,
  OrderableBookingResponseDto,
  StaffAddCompletedChargesRequestDto,
  StaffBookingPricePreviewRequestDto,
  StaffBookingPricePreviewResponseDto,
  StaffCancelBookingResponseDto,
  StaffChangeRoomRequestDto,
  StaffChangeRoomResponseDto,
  StaffCheckoutMultipleRequestDto,
  StaffCheckoutPaymentRequestDto,
  StaffCheckoutRequestDto,
  StaffCreateBookingDto,
  StaffCreateBookingResponseDto,
  StaffCreateCheckoutInvoiceResponseDto,
  StaffUpdateBookingRequestDto,
  StaffUpdateBookingResponseDto,
  UpdateBookingStatusRequestDto,
  UpdateBookingStatusResponseDto,
} from "./dto";

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  BookingPayForRoomRequestSchema,
  BookingUpgradeRoomRequestSchema,
  StaffCreateBookingSchema,
  BookingDetailItemSchema,
  BookingOTAResponseSchema,
  StaffBookingPricePreviewRequestSchema,
  StaffBookingPricePreviewResponseSchema,
  StaffUpdateBookingRequestSchema,
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  BookingPendingChargesResponseSchema,
  AvailableRoomsForChangeResponseSchema,
  StaffCheckoutRequestSchema,
  StaffAddCompletedChargesRequestSchema,
  StaffCreateCheckoutInvoiceResponseSchema,
  StaffCheckoutMultipleRequestSchema,
  StaffCheckoutPaymentRequestSchema,
  ConfirmBookingPaymentRequestSchema,
  ConfirmBookingPaymentResponseSchema,
  OrderableBookingResponseSchema,
  UpdateBookingStatusRequestSchema,
  UpdateBookingStatusResponseSchema,
} = BookingSchema;

async function getBookingList(
  params: BookingListParams
): Promise<BookingListResponseDto> {
  try {
    const resp = await http.get(Booking.list, { params });
    return BookingListResponseSchema.parseAsync(resp.data);
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function getBookingListByWeek(
  params: BookingListParams
): Promise<BookingListByWeekResponseDto> {
  try {
    const resp = await http.get(Booking.listByWeek, { params });
    return BookingListByWeekResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getBookingDetail(
  params: BookingListParams
): Promise<BookingDetailResponseDto> {
  try {
    const code = params.code?.trim();
    const id = params.id?.trim();
    const url = code
      ? Booking.detailByCode(code)
      : id
        ? Booking.detailById(id)
        : null;

    if (!url) {
      return Promise.reject(new Error("ID/Code is required"));
    }
    const resp = await http.get(url);
    return await BookingDetailItemSchema.parseAsync(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getBookingOTA(): Promise<BookingOTAResponseDto> {
  try {
    const resp = await http.get(OTAInformation.list);
    return BookingOTAResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function exportBookings(date?: string): Promise<Blob> {
  try {
    const params = date ? { date } : {};
    const resp = await http.get(Booking.Export, {
      params,
      responseType: "blob",
    });
    if (resp && typeof resp === "object" && "data" in resp) {
      return (resp as any).data;
    }
    return resp as Blob;
  } catch (error) {
    return Promise.reject(error);
  }
}

async function updateBookingStatus(
  data: UpdateBookingStatusRequestDto
): Promise<UpdateBookingStatusResponseDto> {
  try {
    const resp = await http.post(
      Booking.updateStatus,
      UpdateBookingStatusRequestSchema.parse(data)
    );
    return UpdateBookingStatusResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

//?-----------------------------------------

// * flow staff

async function staffCreateBooking(
  idempotencyKey: string,
  data: StaffCreateBookingDto
): Promise<StaffCreateBookingResponseDto> {
  try {
    const parsed = StaffCreateBookingSchema.parse(data);

    const payload = {
      ...parsed,
      checkinDate: toYMD(parsed.checkinDate),
      checkoutDate: toYMD(parsed.checkoutDate),
      breakfastDates: Array.isArray(parsed.breakfastDates)
        ? parsed.breakfastDates.map((bd) => toYMD(bd)).filter(Boolean)
        : undefined,
    };

    const resp = await http.post(Booking.staffCreateBooking, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffBookingPricePreview(
  idempotencyKey: string,
  data: StaffBookingPricePreviewRequestDto
): Promise<StaffBookingPricePreviewResponseDto> {
  try {
    const resp = await http.post(
      Booking.preview,
      StaffBookingPricePreviewRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return StaffBookingPricePreviewResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffUpdateBookingDetail(
  id: string,
  data: StaffUpdateBookingRequestDto
): Promise<StaffUpdateBookingResponseDto> {
  try {
    const resp = await http.put(
      Booking.update(id),
      StaffUpdateBookingRequestSchema.parse(data)
    );
    return StaffUpdateBookingResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getAvailableRoomsForChange(
  bookingId: string,
  bookingRoomId?: string
): Promise<AvailableRoomsForChangeResponseDto> {
  try {
    const resp = await http.get(
      Booking.changeRoom(bookingId, bookingRoomId || "")
    );
    return AvailableRoomsForChangeResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function staffChangeRoom(
  id: string,
  data: StaffChangeRoomRequestDto
): Promise<StaffChangeRoomResponseDto> {
  try {
    const resp = await http.put(
      Booking.update(id),
      StaffChangeRoomRequestSchema.parse(data)
    );
    return StaffChangeRoomResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffCancelBooking(
  id: string
): Promise<StaffCancelBookingResponseDto> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.cancel(id),
      {},
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );

    return StaffCancelBookingResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getBookingPendingCharges(
  bookingId: string
): Promise<BookingPendingChargesResponseDto> {
  try {
    const resp = await http.get(Booking.pendingCharges(bookingId));
    return BookingPendingChargesResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffAddCompletedCharges(
  bookingId: string,
  data: StaffAddCompletedChargesRequestDto
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.addToCompletedRoomOrder(bookingId),
      StaffAddCompletedChargesRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffCreateCheckoutInvoice(
  bookingId: string
): Promise<StaffCreateCheckoutInvoiceResponseDto> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.createInvoice(bookingId),
      {},
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return StaffCreateCheckoutInvoiceResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffCheckoutPayment(
  bookingId: string,
  data: StaffCheckoutPaymentRequestDto
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.payment(bookingId),
      StaffCheckoutPaymentRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffCheckout(
  bookingId: string,
  data: StaffCheckoutRequestDto
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.checkout(bookingId),
      StaffCheckoutRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffCheckoutMultiple(
  data: StaffCheckoutMultipleRequestDto
): Promise<void> {
  try {
    const resp = await http.post(
      Booking.checkoutMultiple,
      StaffCheckoutMultipleRequestSchema.parse(data)
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function staffConfirmBookingPayment(
  bookingId: string,
  data: ConfirmBookingPaymentRequestDto
): Promise<ConfirmBookingPaymentResponseDto> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.confirmPayment(bookingId),
      ConfirmBookingPaymentRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return ConfirmBookingPaymentResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get orderable bookings (active + confirmed bookings available for POS/Service orders)
 */
async function getOrderableBookings(): Promise<OrderableBookingResponseDto> {
  try {
    const resp = await http.get(Booking.orderableBookings);
    return OrderableBookingResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function payForRooms(
  id: string,
  data: BookingPayForRoomRequestDto
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.payForRoom(id),
      BookingPayForRoomRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function upgradeRoom(
  id: string,
  data: BookingUpgradeRoomRequestDto
): Promise<void> {
  const idempotencyKey = crypto.randomUUID();
  try {
    const resp = await http.post(
      Booking.upgradeRoom(id),
      BookingUpgradeRoomRequestSchema.parse(data),
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const BookingService = {
  getBookingList,
  staffCreateBooking,
  getBookingListByWeek,
  getBookingDetail,
  getBookingOTA,
  staffBookingPricePreview,
  staffUpdateBookingDetail,
  getAvailableRoomsForChange,
  staffChangeRoom,
  staffCancelBooking,
  exportBookings,
  getBookingPendingCharges,
  staffAddCompletedCharges,
  staffCreateCheckoutInvoice,
  staffCheckoutPayment,
  staffCheckout,
  staffCheckoutMultiple,

  updateBookingStatus,
  staffConfirmBookingPayment,
  getOrderableBookings,

  payForRooms,
  upgradeRoom,
};
