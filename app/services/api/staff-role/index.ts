import http from "~/lib/http";
import { StaffRole } from "~/services/url";
import { StaffRoleSchema } from "./staff-role.schema";
import type {
  StaffRoleListResponse,
  CreateStaffRoleRequest,
  UpdateStaffRoleRequest,
  StaffRoleDetailResponse,
  DeleteStaffRoleResponse,
} from "./dto";

const { StaffRoleListResponseSchema, StaffRoleDetailResponseSchema } =
  StaffRoleSchema;

/**
 * GET /api/StaffRoles - Lấy danh sách vai trò nhân sự
 */
async function getStaffRoleList(): Promise<StaffRoleListResponse> {
  try {
    const resp = await http.get(StaffRole.list);
    return StaffRoleListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * POST /api/StaffRoles - Tạo mới vai trò nhân sự
 */
async function createStaffRole(
  data: CreateStaffRoleRequest
): Promise<StaffRoleDetailResponse> {
  try {
    const resp = await http.post(StaffRole.create, data);
    return StaffRoleDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * GET /api/StaffRoles/{id} - Lấy thông tin chi tiết vai trò nhân sự
 */
async function getStaffRoleById(id: string): Promise<StaffRoleDetailResponse> {
  try {
    const resp = await http.get(StaffRole.detail(id));
    return StaffRoleDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * PUT /api/StaffRoles/{id} - Cập nhật thông tin vai trò nhân sự
 */
async function updateStaffRole(
  id: string,
  data: UpdateStaffRoleRequest
): Promise<StaffRoleDetailResponse> {
  try {
    const resp = await http.put(StaffRole.update(id), data);
    return StaffRoleDetailResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * DELETE /api/StaffRoles/{id} - Xóa vai trò nhân sự
 */
async function deleteStaffRole(id: string): Promise<DeleteStaffRoleResponse> {
  try {
    const resp = await http.delete(StaffRole.delete(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffRoleService = {
  getStaffRoleList,
  createStaffRole,
  getStaffRoleById,
  updateStaffRole,
  deleteStaffRole,
};
