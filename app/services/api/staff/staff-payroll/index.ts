import http from "~/lib/http";
import { StaffPayroll } from "~/services/url";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";
import type {
  PayrollListDto,
  PayrollGridParams,
  GeneratePayrollDto,
  PayrollDetailDto,
  GenerateSinglePayrollDto,
  ApplyUnusedLeaveDto,
  UpdatePayrollDto,
  PayrollComponentInputDto,
  PayrollComponentListDto,
} from "./dto";

const {
  PayrollListSchema,
  PayrollDetailSchema,
  PayrollComponentListSchema,
  GeneratePayrollSchema,
  GenerateSinglePayrollSchema,
  ApplyUnusedLeaveSchema,
  UpdatePayrollSchema,
  PayrollComponentInputSchema,
} = StaffPayrollSchema;

/**
 * Get payroll grid list
 */
async function getPayrollGrid(
  params?: PayrollGridParams
): Promise<PayrollListDto> {
  try {
    const resp = await http.get(StaffPayroll.grid, { params });
    return PayrollListSchema.parse(resp.data);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Generate payroll for all staff (bulk)
 */
async function generatePayroll(
  data: GeneratePayrollDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = GeneratePayrollSchema.parse(data);
    const resp = await http.post(StaffPayroll.generate, validated);
    return resp.data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Generate payroll for single staff
 */
async function generateSinglePayroll(
  staffId: string,
  data: GenerateSinglePayrollDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = GenerateSinglePayrollSchema.parse(data);
    const resp = await http.post(
      StaffPayroll.generateSingle(staffId),
      validated
    );
    return resp.data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Get payroll detail by ID
 */
async function getPayrollDetail(id: string): Promise<PayrollDetailDto> {
  try {
    const resp = await http.get(StaffPayroll.detail(id));
    return PayrollDetailSchema.parse(resp.data);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Update payroll (base salary, paid amount)
 */
async function updatePayroll(
  id: string,
  data: UpdatePayrollDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = UpdatePayrollSchema.parse(data);
    const resp = await http.put(StaffPayroll.update(id), validated);
    return resp.data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Apply unused leave mode (PayOut / CarryOver)
 */
async function applyUnusedLeave(
  id: string,
  data: ApplyUnusedLeaveDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = ApplyUnusedLeaveSchema.parse(data);
    const resp = await http.post(StaffPayroll.applyUnusedLeave(id), validated);
    return resp.data;
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Get components list for a payroll
 */
async function getComponents(id: string): Promise<PayrollComponentListDto> {
  try {
    const resp = await http.get(StaffPayroll.getComponents(id));
    return PayrollComponentListSchema.parse(resp.data);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Add component to payroll
 */
async function addComponent(
  id: string,
  data: PayrollComponentInputDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = PayrollComponentInputSchema.parse(data);
    const resp = await http.post(StaffPayroll.addComponent(id), validated);
    return resp.data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Update component
 */
async function updateComponent(
  componentId: string,
  data: PayrollComponentInputDto
): Promise<{ success: boolean; message: string }> {
  try {
    const validated = PayrollComponentInputSchema.parse(data);
    const resp = await http.put(
      StaffPayroll.updateComponent(componentId),
      validated
    );
    return resp.data;
  } catch (error) {
    console.log(error);
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
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Export monthly payroll (toàn bộ nhân viên)
 */
async function exportMonthly(params: {
  year: number;
  month: number;
}): Promise<Blob> {
  try {
    const resp = await http.get(StaffPayroll.exportMonthly, {
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
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Export payslip for single payroll (1 nhân viên)
 */
async function exportPayslip(id: string): Promise<Blob> {
  try {
    const resp = await http.get(StaffPayroll.exportPayslip(id), {
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
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Refresh days for all payrolls (toàn bộ nhân viên)
 */
async function refreshDays(params: {
  year: number;
  month: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.refreshDays, null, { params });
    return resp.data;
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

/**
 * Refresh days for single payroll (1 nhân viên)
 */
async function refreshSinglePayroll(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await http.post(StaffPayroll.refreshSinglePayroll(id));
    return resp.data;
  } catch (error) {
    console.log(error);
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
  exportMonthly,
  exportPayslip,
  refreshDays,
  refreshSinglePayroll,
};
