import http from "~/lib/http";
import useBookingSchema from "~/services/schema/booking.schema";
import { format, parseISO } from "date-fns";
import type { BookingListParams } from "~/services/types/booking.types";
import { Booking, OTAInformation } from "../../url";
import type {
  BookingDetailResponseDto,
  BookingListByWeekResponseDto,
  BookingListResponseDto,
  BookingOTAResponseDto,
  StaffCreateBookingDto,
  StaffCreateBookingResponseDto,
} from "./dto";
import { toYMD } from "~/lib/utils";

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  StaffCreateBookingResponseSchema,
  StaffCreateBookingSchema,
  BookingDetailItemSchema,
  BookingOTAResponseSchema,
} = useBookingSchema();

async function getBookingList(
  params: BookingListParams
): Promise<BookingListResponseDto> {
  try {
    const resp = await http.get(Booking.list, { params });
    return BookingListResponseSchema.parseAsync(resp.data);
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
    return StaffCreateBookingResponseSchema.parse(resp.data);
  } catch (error) {
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
export const BookingService = {
  getBookingList,
  staffCreateBooking,
  getBookingListByWeek,
  getBookingDetail,
  getBookingOTA,
};
