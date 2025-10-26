import http from "~/lib/http";
import useBookingSchema from "~/services/schema/booking.schema";
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

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  StaffCreateBookingResponseSchema,
  StaffCreateBookingSchema,
  BookingItemSchema,
  BookingOTAResponseSchema,
} = useBookingSchema();

async function getBookingList(
  params: BookingListParams
): Promise<BookingListResponseDto> {
  try {
    const resp = await http.get(Booking.list, { params });
    const data = BookingListResponseSchema.parseAsync(resp.data);
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

async function staffCreateBooking(
  data: StaffCreateBookingDto
): Promise<StaffCreateBookingResponseDto> {
  try {
    const resp = await http.post(
      Booking.create,
      StaffCreateBookingSchema.parse(data)
    );
    return StaffCreateBookingResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getBookingDetail(
  params: BookingListParams
): Promise<BookingDetailResponseDto> {
  try {
    let resp = null;
    if (params.code) {
      resp = await http.get(Booking.detailByCode(params.code), {
        params,
      });
    } else if (params.id) {
      resp = await http.get(Booking.detailById(params.id!), {
        params,
      });
    } else {
      return Promise.reject(new Error("ID/Code is required"));
    }
    console.log(resp);
    return BookingItemSchema.parse(resp.data);
  } catch (error) {
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
