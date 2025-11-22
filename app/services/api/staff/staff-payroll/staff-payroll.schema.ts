import { z } from "zod";

// Enum for UnusedLeaveMode (chỉ 2 options: PayOut và CarryOver)
export const UnusedLeaveModeEnum = z.enum(["PayOut", "CarryOver"]);

// Component Type Enum
export const PayrollComponentTypeEnum = z.enum([
  "Bonus",
  "Allowance",
  "Responsibility",
  "LeavePayout",
  "AdjustmentIncrease",
  "Penalty",
  "Advance",
  "AdjustmentDecrease",
]);

// Component schema (phụ cấp/khấu trừ)
const PayrollComponentSchema = z.object({
  componentId: z.uuid(),
  type: z.string(),
  title: z.string(),
  note: z.string().nullable().optional(),
  amount: z.number(),
});

// Single payroll item schema
const PayrollItemSchema = z.object({
  index: z.number().optional(),
  payrollId: z.uuid(),
  staffId: z.uuid(),
  staffCode: z.string(),
  staffName: z.string(),
  daysInMonth: z.number().optional(),
  assignedDays: z.number().optional(),
  workDays: z.number().optional(),
  paidLeaveQuota: z.number().optional(),
  paidLeaveDaysUsed: z.number().optional(),
  unpaidLeaveDays: z.number().optional(),
  paidLeaveDaysRemaining: z.number().optional(),
  paidLeaveDaysCarryOver: z.number().optional(),
  unusedLeaveMode: z.string().optional(),
  baseSalaryFullMonth: z.number().optional(),
  baseSalaryCalculated: z.number().optional(),
  componentsTotal: z.number().optional(),
  totalAmount: z.number().optional(),
  paidAmount: z.number(),
  remainingAmount: z.number(),
  locked: z.boolean(),
  hasUnusedLeavePending: z.boolean().optional(),
  components: z.array(PayrollComponentSchema).optional().default([]),
});

// Clean domain schemas (no wrappers)
const PayrollDetailSchema = PayrollItemSchema;
const PayrollListSchema = z.array(PayrollItemSchema);
const PayrollComponentListSchema = z.array(PayrollComponentSchema);

// Generate payroll request schema (for all staff)
const GeneratePayrollSchema = z.object({
  year: z.number(),
  month: z.number(),
});

// Generate single payroll request schema (for one staff)
const GenerateSinglePayrollSchema = z.object({
  year: z.number(),
  month: z.number(),
  baseSalaryFullMonth: z.number().optional(),
});

// Apply unused leave request schema
const ApplyUnusedLeaveSchema = z.object({
  mode: UnusedLeaveModeEnum,
});

// Update payroll request schema
const UpdatePayrollSchema = z.object({
  baseSalaryFullMonth: z.number().optional(),
  paidAmount: z.number().optional(),
});

// Create/Update Component Request Schema
const PayrollComponentInputSchema = z.object({
  type: PayrollComponentTypeEnum,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  note: z.string().optional(),
  amount: z.number(),
  effectiveDate: z.string().optional(),
});

// Add/Edit Component Form Schema (for UI validation)
const AddComponentFormSchema = z.object({
  type: PayrollComponentTypeEnum,
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  amount: z.number().min(1, "Vui lòng nhập số tiền"),
  note: z.string().optional(),
  effectiveDate: z.string().optional(),
});

export const StaffPayrollSchema = {
  // Core schemas
  PayrollItemSchema,
  PayrollDetailSchema,
  PayrollListSchema,
  PayrollComponentSchema,
  PayrollComponentListSchema,

  // Input schemas
  GeneratePayrollSchema,
  GenerateSinglePayrollSchema,
  ApplyUnusedLeaveSchema,
  UpdatePayrollSchema,
  PayrollComponentInputSchema,

  // Enums
  UnusedLeaveModeEnum,
  PayrollComponentTypeEnum,

  // Form schemas
  AddComponentFormSchema,
};
