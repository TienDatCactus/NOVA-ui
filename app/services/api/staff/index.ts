import http from "~/lib/http";
import { StaffSchema } from "./staff.schema";
import { Staff } from "~/services/url";
import type {
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffDetailResponse,
  DeleteStaffResponse,
} from "./dto";
import type { StaffListParams } from "./staff.types";

const {
  StaffListResponseSchema,
  StaffDetailResponseSchema,
  DeleteStaffResponseSchema,
} = StaffSchema;

/**
 * GET /api/Staffs - Lấy danh sách nhân sự
 */
async function getStaffList(
  params?: StaffListParams
): Promise<StaffListResponse> {
  try {
    const response = await http.get(Staff.list, { params });
    return StaffListResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * POST /api/Staffs - Tạo mới nhân sự
 */
async function createStaff(
  data: CreateStaffRequest
): Promise<StaffDetailResponse> {
  try {
    const response = await http.post(Staff.create, data);
    return StaffDetailResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * GET /api/Staffs/{id} - Lấy thông tin chi tiết nhân sự
 */
async function getStaffById(id: string): Promise<StaffDetailResponse> {
  try {
    const response = await http.get(Staff.detail(id));
    return StaffDetailResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * PUT /api/Staffs/{id} - Cập nhật thông tin nhân sự
 */
async function updateStaff(
  id: string,
  data: UpdateStaffRequest
): Promise<StaffDetailResponse> {
  try {
    const response = await http.put(Staff.update(id), data);
    return StaffDetailResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * DELETE /api/Staffs/{id} - Xóa nhân sự
 */
async function deleteStaff(id: string): Promise<DeleteStaffResponse> {
  try {
    const response = await http.delete(Staff.delete(id));
    return DeleteStaffResponseSchema.parse(response);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffService = {
  getStaffList,
  createStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};
