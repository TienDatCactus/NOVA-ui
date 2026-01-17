import http from "~/lib/http";
import { Staff } from "~/services/url";
import type {
  CreateStaffDto,
  RehireStaffDto,
  StaffDetailDto,
  StaffListDto,
  TerminateStaffDto,
  UpdateStaffDto,
} from "./dto";
import { StaffSchema } from "./staff.schema";
import type { StaffListParams } from "./staff.types";

const {
  StaffListSchema,
  StaffDetailSchema,
  CreateStaffSchema,
  UpdateStaffSchema,
} = StaffSchema;

/**
 */
async function getStaffList(
  params?: StaffListParams,
  isActive?: boolean,
): Promise<StaffListDto> {
  try {
    const response = await http.get(isActive ? Staff.active : Staff.list, {
      params,
    });
    return StaffListSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * POST /api/Staffs - Tạo mới nhân sự
 */
async function createStaff(data: CreateStaffDto): Promise<StaffDetailDto> {
  try {
    const validatedData = CreateStaffSchema.parse(data);
    const response = await http.post(Staff.create, validatedData);
    return StaffDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * GET /api/Staffs/{id} - Lấy thông tin chi tiết nhân sự
 */
async function getStaffById(id: string): Promise<StaffDetailDto> {
  try {
    const response = await http.get(Staff.detail(id));
    return StaffDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * PUT /api/Staffs/{id} - Cập nhật thông tin nhân sự
 */
async function updateStaff(
  id: string,
  data: UpdateStaffDto,
): Promise<StaffDetailDto> {
  try {
    const validatedData = UpdateStaffSchema.parse(data);
    const response = await http.put(Staff.update(id), validatedData);
    return StaffDetailSchema.parse(response.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * DELETE /api/Staffs/{id} - Xóa nhân sự
 */
async function deleteStaff(id: string): Promise<void> {
  try {
    const resp = await http.delete(Staff.delete(id));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function terminateStaff(
  id: string,
  data: TerminateStaffDto,
): Promise<void> {
  try {
    const resp = await http.post(Staff.terminate(id), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getStaffsHasPayrollinMonth(
  year: number,
  month: number,
): Promise<StaffListDto> {
  try {
    const resp = await http.get(Staff.payrollMonth(year, month));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
async function rehireStaff(
  id: string,
  data: RehireStaffDto,
): Promise<StaffListDto> {
  try {
    const resp = await http.post(Staff.rehire(id), data);
    return resp.data;
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
  terminateStaff,
  getStaffsHasPayrollinMonth,
  rehireStaff,
};
