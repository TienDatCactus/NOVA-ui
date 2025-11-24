import { Refunds } from "~/services/url";
import type { CreateRefundForBookingRequestDto } from "./dto";
import http from "~/lib/http";
import { RefundsSchemas } from "./refunds.schema";
const { CreateRefundForBookingResponseSchema, BookingRefundHistorySchema } =
  RefundsSchemas;

async function createBookingRefund(
  bookingId: string,
  data: CreateRefundForBookingRequestDto
) {
  try {
    const resp = await http.post(
      Refunds.createRefundForBooking(bookingId),
      data
    );
    return CreateRefundForBookingResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function bookingRefundHistory(bookingId: string) {
  try {
    const resp = await http.get(Refunds.getBookingRefundHistory(bookingId));
    return BookingRefundHistorySchema.parse(resp.data);
  } catch (error) {
    console.error(error);
  }
}

export const RefundsService = {
  createBookingRefund,
  bookingRefundHistory,
};
