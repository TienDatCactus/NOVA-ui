import http from "~/lib/http";
import { StaffAttendance } from "~/services/url";
import type { MarkAbsentRequest, StaffAttendanceListResponse } from "./dto";
import { StaffAttendanceSchema } from "./staff-attendance.schema";
import type { StaffAttendanceListParams } from "./staff-attendance.type";

const { StaffAttendanceListResponseSchema } = StaffAttendanceSchema;

/**
 * Get staff attendance list with filters
 */
async function getStaffAttendanceList(
  params: StaffAttendanceListParams
): Promise<StaffAttendanceListResponse> {
  try {
    const resp = await http.get(StaffAttendance.list, { params });
    return StaffAttendanceListResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Mark staff as absent
 */
async function markAbsent(
  assignmentId: string,
  data: MarkAbsentRequest
): Promise<any> {
  try {
    const resp = await http.post(StaffAttendance.absent(assignmentId), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Mark staff as present
 */
async function markPresent(assignmentId: string): Promise<any> {
  try {
    const resp = await http.post(StaffAttendance.present(assignmentId));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffAttendanceService = {
  getStaffAttendanceList,
  markAbsent,
  markPresent,
};
