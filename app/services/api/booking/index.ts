import http from "~/lib/http";
import { Booking } from "../../url";
import type {
  BookingDetailResponseDto,
  BookingListByWeekResponseDto,
  BookingListResponseDto,
  ExternalBookingResponseDto,
  ExternalCreateBookingDto,
} from "./dto";
import type { BookingListParams } from "~/services/types/booking.types";
import useBookingSchema from "~/services/schema/booking.schema";
const {
  BookingListResponseSchema,
  ExternalBookingResponseSchema,
  ExternalCreateBookingSchema,
  BookingListByWeekResponseSchema,
  BookingItemSchema,
} = useBookingSchema();
async function getBookingList(
  params: BookingListParams
): Promise<BookingListResponseDto> {
  try {
    const resp = await http.get(Booking.list, { params });
    const data = BookingListResponseSchema.parse(resp.data);
    return data;
  } catch (err) {
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

async function externalCreateBooking(
  data: ExternalCreateBookingDto
): Promise<ExternalBookingResponseDto> {
  try {
    const resp = await http.post(
      Booking.create,
      ExternalCreateBookingSchema.parse(data)
    );
    return ExternalBookingResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getBookingByCode(
  params: BookingListParams
): Promise<BookingDetailResponseDto> {
  try {
    if (!params.code) {
      return Promise.reject(new Error("Code is required"));
    }
    const resp = await http.get(Booking.detail(params.code), {
      params,
    });
    return BookingItemSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const BookingService = {
  getBookingList,
  externalCreateBooking,
  getBookingListByWeek,
  getBookingByCode,
};
