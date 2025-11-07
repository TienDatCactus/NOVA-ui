import http from "~/lib/http";

import { toYMD } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { BookingListParams } from "~/services/api/booking/booking.types";
import { Booking, OTAInformation } from "../../url";
import type {
  BookingDetailResponseDto,
  BookingListByWeekResponseDto,
  BookingListResponseDto,
  BookingOTAResponseDto,
  StaffBookingPricePreviewRequestDto,
  StaffBookingPricePreviewResponseDto,
  StaffCancelBookingResponseDto,
  StaffChangeRoomRequestDto,
  StaffChangeRoomResponseDto,
  StaffCreateBookingDto,
  StaffCreateBookingResponseDto,
  StaffUpdateBookingRequestDto,
  StaffUpdateBookingResponseDto,
  AvailableRoomsForChangeResponseDto,
  BookingPendingChargesResponseDto,
} from "./dto";
import { data } from "react-router";

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  StaffCreateBookingResponseSchema,
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
  bookingRoomId: string
): Promise<AvailableRoomsForChangeResponseDto> {
  try {
    const resp = await http.get(Booking.changeRoom(bookingId, bookingRoomId));
    const parsed = AvailableRoomsForChangeResponseSchema.parse(resp);
    return parsed;
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

async function staffCreateInvoice(bookingId: string) {
  try {
    const resp = await http.get(Booking.pendingCharges(bookingId));
    return BookingPendingChargesResponseSchema.parse(resp.data);
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
};
