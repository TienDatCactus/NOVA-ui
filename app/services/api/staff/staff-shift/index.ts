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
    return resp.data;
  } catch (error) {
    console.error(error);
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
    console.error(error);
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
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

// PUT /api/StaffShifts/{id}/schedule - Update shift schedule
async function updateShiftSchedule(
  id: string,
  data: UpdateShiftScheduleRequest
): Promise<StaffShiftMutationResponseDto> {
  try {
    const resp = await http.put(
      StaffShift.update(id),
      UpdateShiftScheduleRequestSchema.parse(data)
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

// GET /api/StaffShifts/export-weekly-matrix - Export weekly matrix (no staff filter)
async function exportWeeklyMatrix(params?: {
  from?: string;
  to?: string;
}): Promise<Blob> {
  try {
    const resp = await http.get(StaffShift.exportWeeklyMatrix, {
      params,
      responseType: "blob",
    });
    let blobData = resp;
    if (blobData instanceof Blob) {
      return blobData;
    }
    const blobContent =
      typeof blobData === "object" ? JSON.stringify(blobData) : blobData;
    return new Blob([blobContent as BlobPart]);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

// GET /api/StaffShifts/export-weekly-form2 - Export weekly form 2 (with from/to params)
async function exportWeeklyForm2(params: {
  from: string;
  to: string;
}): Promise<Blob> {
  try {
    const resp = await http.get(StaffShift.exportWeeklyForm2, {
      params,
      responseType: "blob",
    });
    let blobData = resp;
    if (blobData instanceof Blob) {
      return blobData;
    }
    const blobContent =
      typeof blobData === "object" ? JSON.stringify(blobData) : blobData;
    return new Blob([blobContent as BlobPart]);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const StaffShiftService = {
  getStaffShiftList,
  createShiftSchedule,
  getStaffShiftById,
  deleteStaffShift,
  updateShiftSchedule,
  exportWeeklyMatrix,
  exportWeeklyForm2,
};
