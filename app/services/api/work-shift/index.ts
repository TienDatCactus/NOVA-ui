import http from "~/lib/http";
import { WorkShift } from "~/services/url";
import { WorkShiftSchema } from "./work-shift.schema";
import type {
  WorkShiftListResponseDto,
  WorkShiftDetailResponseDto,
  CreateWorkShiftRequest,
  UpdateWorkShiftRequest,
  WorkShiftMutationResponseDto,
} from "./dto";

const {
  WorkShiftListResponseSchema,
  WorkShiftDetailResponseSchema,
  WorkShiftMutationResponseSchema,
} = WorkShiftSchema;

// GET /api/WorkShifts - Get list of work shifts
async function getWorkShiftList(): Promise<WorkShiftListResponseDto> {
  try {
    const resp = await http.get(WorkShift.list);
    return WorkShiftListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error("Error fetching work shift list:", error);
    return Promise.reject(error);
  }
}

// GET /api/WorkShifts/active - Get list of active work shifts only
async function getActiveWorkShiftList(): Promise<WorkShiftListResponseDto> {
  try {
    const resp = await http.get(WorkShift.active);
    return WorkShiftListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error("Error fetching active work shift list:", error);
    return Promise.reject(error);
  }
}

// POST /api/WorkShifts - Create new work shift
async function createWorkShift(
  data: CreateWorkShiftRequest
): Promise<WorkShiftMutationResponseDto> {
  try {
    const resp = await http.post(WorkShift.create, data);
    return WorkShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// GET /api/WorkShifts/{id} - Get work shift detail by ID
async function getWorkShiftById(
  id: string
): Promise<WorkShiftDetailResponseDto> {
  try {
    const resp = await http.get(WorkShift.detail(id));
    return WorkShiftDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// PUT /api/WorkShifts/{id} - Update work shift
async function updateWorkShift(
  id: string,
  data: UpdateWorkShiftRequest
): Promise<WorkShiftMutationResponseDto> {
  try {
    const resp = await http.put(WorkShift.update(id), data);
    return WorkShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

// DELETE /api/WorkShifts/{id} - Delete work shift (soft delete)
async function deleteWorkShift(
  id: string
): Promise<WorkShiftMutationResponseDto> {
  try {
    const resp = await http.delete(WorkShift.delete(id));
    return WorkShiftMutationResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const WorkShiftService = {
  getWorkShiftList,
  getActiveWorkShiftList,
  createWorkShift,
  getWorkShiftById,
  updateWorkShift,
  deleteWorkShift,
};
