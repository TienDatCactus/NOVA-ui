import http from "~/lib/http";
import { StaffPayroll } from "~/services/url";
import { StaffPayrollSchema } from "~/services/schema/staff-payroll.schema";
import type {
  PayrollGridListResponse,
  PayrollGridParams,
  GeneratePayrollRequest,
  PayrollDetailResponse,
  GenerateSinglePayrollRequest,
  ApplyUnusedLeaveRequest,
  UpdatePayrollRequest,
  ComponentRequest,
  ComponentListResponse,
} from "./dto";

const { PayrollGridListResponseSchema, PayrollDetailResponseSchema } =
  StaffPayrollSchema;

/**
 * Get payroll grid list
 */
async function getPayrollGrid(
  params?: PayrollGridParams
): Promise<PayrollGridListResponse> {
  try {
    const resp = await http.get(StaffPayroll.grid, { params });
    console.log("getPayrollGrid response:", resp.data);
    // resp.data is already the full response object with success, statusCode, message, data
    return resp.data;
  } catch (error) {
    console.error("getPayrollGrid error:", error);
    return Promise.reject(error);
  }
}

/**
 * Generate payroll for all staff (bulk)
 */
async function generatePayroll(
  data: GeneratePayrollRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.generate, data);
    console.log("generatePayroll response:", resp.data);
    return resp.data;
  } catch (error) {
    console.error("generatePayroll error:", error);
    return Promise.reject(error);
  }
}

/**
 * Generate payroll for single staff
 */
async function generateSinglePayroll(
  staffId: string,
  data: GenerateSinglePayrollRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.generateSingle(staffId), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get payroll detail by ID
 */
async function getPayrollDetail(id: string): Promise<PayrollDetailResponse> {
  try {
    const resp = await http.get(StaffPayroll.detail(id));
    console.log("getPayrollDetail response:", resp.data);
    // resp.data is already the full response object
    return resp.data;
  } catch (error) {
    console.error("getPayrollDetail error:", error);
    return Promise.reject(error);
  }
}

/**
 * Update payroll (base salary, paid amount)
 */
async function updatePayroll(
  id: string,
  data: UpdatePayrollRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.put(StaffPayroll.update(id), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Apply unused leave mode (PayOut / CarryOver)
 */
async function applyUnusedLeave(
  id: string,
  data: ApplyUnusedLeaveRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.applyUnusedLeave(id), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Lock payroll (change status to locked)
 */
async function lockPayroll(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.lock(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Unlock payroll (change status to unlocked)
 */
async function unlockPayroll(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.unlock(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Get components list for a payroll
 */
async function getComponents(id: string): Promise<ComponentListResponse> {
  try {
    const resp = await http.get(StaffPayroll.getComponents(id));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Add component to payroll
 */
async function addComponent(
  id: string,
  data: ComponentRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.addComponent(id), data);
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update component
 */
async function updateComponent(
  componentId: string,
  data: ComponentRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.put(
      StaffPayroll.updateComponent(componentId),
      data
    );
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Delete component
 */
async function deleteComponent(
  componentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.delete(StaffPayroll.deleteComponent(componentId));
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const StaffPayrollService = {
  getPayrollGrid,
  generatePayroll,
  generateSinglePayroll,
  getPayrollDetail,
  updatePayroll,
  applyUnusedLeave,
  lockPayroll,
  unlockPayroll,
  getComponents,
  addComponent,
  updateComponent,
  deleteComponent,
};
