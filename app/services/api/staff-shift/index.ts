import http from "~/lib/http";
import { StaffShift } from "~/services/url";
import { StaffShiftSchema } from "./staff-shift.schema";
import type {
  StaffShiftListResponseDto,
  StaffShiftDetailResponseDto,
  CreateShiftScheduleRequest,
  UpdateShiftScheduleRequest,
  StaffShiftMutationResponseDto,
} from "./dto";
import type { StaffShiftListParams } from "./staff-shift.type";
import { DeleteScope } from "./staff-shift.type";
const {
  StaffShiftListResponseSchema,
  StaffShiftDetailResponseSchema,
  UpdateShiftScheduleRequestSchema,
  StaffShiftMutationResponseSchema,
} = StaffShiftSchema;

// GET /api/StaffShifts - Get list of staff shifts with optional filters
async function getStaffShiftList(
  params?: StaffShiftListParams
): Promise<StaffShiftListResponseDto> {
  try {
    const resp = await http.get(StaffShift.list, { params });
    return StaffShiftListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error("Error fetching staff shift list:", error);
    return Promise.reject(error);
  }
}

// POST /api/StaffShifts/schedule - Create schedule with repeat logic
async function createShiftSchedule(
  data: CreateShiftScheduleRequest
): Promise<StaffShiftMutationResponseDto> {
  try {
    const resp = await http.post(StaffShift.schedule, data);
    return StaffShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// GET /api/StaffShifts/{id} - Get staff shift detail by ID
async function getStaffShiftById(
  id: string
): Promise<StaffShiftDetailResponseDto> {
  try {
    const resp = await http.get(StaffShift.detail(id));
    return StaffShiftDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// DELETE /api/StaffShifts/{id} - Delete staff shift
async function deleteStaffShift(
  id: string,
  scope?: DeleteScope
): Promise<StaffShiftMutationResponseDto> {
  try {
    const resp = await http.delete(StaffShift.delete(id), {
      params: { scope },
    });
    return StaffShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// PUT /api/StaffShifts/{id}/schedule - Update shift schedule
async function updateShiftSchedule(
  id: string,
  data: UpdateShiftScheduleRequest
): Promise<StaffShiftMutationResponseDto> {
  try {
    const resp = await http.put(StaffShift.update(id), data);
    return StaffShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffShiftService = {
  getStaffShiftList,
  createShiftSchedule,
  getStaffShiftById,
  deleteStaffShift,
  updateShiftSchedule,
};
