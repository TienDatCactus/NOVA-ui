import http from "~/lib/http";
import { StaffRole } from "~/services/url";
import { StaffRoleSchema } from "./staff-role.schema";
import type {
  StaffRoleListDto,
  StaffRoleDetailDto,
  CreateStaffRoleDto,
  UpdateStaffRoleDto,
} from "./dto";

const {
  StaffRoleListSchema,
  StaffRoleDetailSchema,
  CreateStaffRoleSchema,
  UpdateStaffRoleSchema,
} = StaffRoleSchema;

/**
 * GET /api/StaffRoles - Lấy danh sách Chức vụ nhân sự
 */
async function getStaffRoleList(): Promise<StaffRoleListDto> {
  try {
    const response = await http.get(StaffRole.list);
    return StaffRoleListSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * POST /api/StaffRoles - Tạo mới Chức vụ nhân sự
 */
async function createStaffRole(
  data: CreateStaffRoleDto
): Promise<StaffRoleDetailDto> {
  try {
    const validatedData = CreateStaffRoleSchema.parse(data);
    const response = await http.post(StaffRole.create, validatedData);
    return StaffRoleDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * GET /api/StaffRoles/{id} - Lấy thông tin chi tiết Chức vụ nhân sự
 */
async function getStaffRoleById(id: string): Promise<StaffRoleDetailDto> {
  try {
    const response = await http.get(StaffRole.detail(id));
    return StaffRoleDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * PUT /api/StaffRoles/{id} - Cập nhật thông tin Chức vụ nhân sự
 */
async function updateStaffRole(
  id: string,
  data: UpdateStaffRoleDto
): Promise<StaffRoleDetailDto> {
  try {
    const validatedData = UpdateStaffRoleSchema.parse(data);
    const response = await http.put(StaffRole.update(id), validatedData);
    return StaffRoleDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * DELETE /api/StaffRoles/{id} - Xóa Chức vụ nhân sự
 */
async function deleteStaffRole(id: string): Promise<void> {
  try {
    const resp = await http.delete(StaffRole.delete(id));
    return resp.data;
  } catch (error) {
    console.error(error);
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
