import http from "~/lib/http";
import { Booking } from "../../url";
import type { BookingListResponseDto } from "./dto";
import type { BookingListParams } from "~/services/types/booking.types";

async function getBookingList(
  params: BookingListParams = {}
): Promise<BookingListResponseDto> {
  try {
    const response = await http.get(Booking.list, { params });
    return response.data;
  } catch (err) {
    return Promise.reject(err);
  }
}

export const BookingService = {
  getBookingList,
};
