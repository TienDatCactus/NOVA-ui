import http from "~/lib/http";
import { Holiday } from "~/services/url";
import { HolidaySchema } from "./holiday.schema";
import type {
  HolidayListResponseDto,
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from "./dto";

const { HolidayListResponseSchema } = HolidaySchema;

// GET /api/Holidays - Get list of holidays
async function getHolidayList(): Promise<HolidayListResponseDto> {
  try {
    const resp = await http.get(Holiday.list);
    return HolidayListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error("Error fetching holiday list:", error);
    return Promise.reject(error);
  }
}

// POST /api/Holidays - Create new holiday
async function createHoliday(data: CreateHolidayRequest): Promise<void> {
  try {
    const resp = await http.post(Holiday.create, data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// GET /api/Holidays/{id} - Get holiday detail by ID
async function getHolidayById(id: string): Promise<void> {
  try {
    const resp = await http.get(Holiday.detail(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// PUT /api/Holidays/{id} - Update holiday
async function updateHoliday(
  id: string,
  data: UpdateHolidayRequest
): Promise<void> {
  try {
    const resp = await http.put(Holiday.update(id), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

// DELETE /api/Holidays/{id} - Delete holiday (soft delete)
async function deleteHoliday(id: string): Promise<void> {
  try {
    const resp = await http.delete(Holiday.delete(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const HolidayService = {
  getHolidayList,
  createHoliday,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
};
