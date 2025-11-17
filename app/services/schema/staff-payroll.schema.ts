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
  componentId: z.string(),
  type: z.string(),
  title: z.string(),
  note: z.string().nullable().optional(),
  amount: z.number(),
});

// Single payroll item schema
const PayrollItemSchema = z.object({
  index: z.number().optional(),
  payrollId: z.string(),
  staffId: z.string(),
  staffCode: z.string(),
  staffName: z.string(),
  year: z.number(),
  month: z.number(),
  daysInMonth: z.number(),
  workDays: z.number(),
  paidLeaveQuota: z.number(),
  paidLeaveDaysUsed: z.number(),
  unpaidLeaveDays: z.number(),
  paidLeaveDaysRemaining: z.number(),
  paidLeaveDaysCarryOver: z.number(),
  unusedLeaveMode: z.string(),
  baseSalaryFullMonth: z.number(),
  baseSalaryCalculated: z.number(),
  componentsTotal: z.number(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  remainingAmount: z.number(),
  locked: z.boolean(),
  hasUnusedLeavePending: z.boolean(),
  components: z.array(PayrollComponentSchema).optional().default([]),
});

// Payroll detail response schema
const PayrollDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: PayrollItemSchema,
  meta: z.string().nullable().optional(),
});

// Payroll grid list response schema
const PayrollGridListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(PayrollItemSchema),
  meta: z.string().nullable().optional(),
});

// Generate payroll request schema (for all staff)
const GeneratePayrollRequestSchema = z.object({
  year: z.number(),
  month: z.number(),
});

// Generate single payroll request schema (for one staff)
const GenerateSinglePayrollRequestSchema = z.object({
  year: z.number(),
  month: z.number(),
  baseSalaryFullMonth: z.number(),
});

// Apply unused leave request schema
const ApplyUnusedLeaveRequestSchema = z.object({
  mode: UnusedLeaveModeEnum,
});

// Update payroll request schema
const UpdatePayrollRequestSchema = z.object({
  baseSalaryFullMonth: z.number().optional(),
  paidAmount: z.number().optional(),
});

// Create/Update Component Request Schema
const ComponentRequestSchema = z.object({
  type: PayrollComponentTypeEnum,
  title: z.string().min(1, "Tiêu đề không được để trống"),
  note: z.string().optional(),
  amount: z.number(),
  effectiveDate: z.string().optional(),
});

// Component List Response Schema
const ComponentListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(PayrollComponentSchema),
  meta: z.string().nullable().optional(),
});

// Add/Edit Component Form Schema (for UI validation)
const AddComponentFormSchema = z.object({
  type: PayrollComponentTypeEnum,
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  amount: z.string().min(1, "Vui lòng nhập số tiền"),
  note: z.string().optional(),
  effectiveDate: z.string().optional(),
});

export const StaffPayrollSchema = {
  PayrollItemSchema,
  PayrollDetailResponseSchema,
  PayrollGridListResponseSchema,
  GeneratePayrollRequestSchema,
  GenerateSinglePayrollRequestSchema,
  ApplyUnusedLeaveRequestSchema,
  UpdatePayrollRequestSchema,
  PayrollComponentSchema,
  UnusedLeaveModeEnum,
  PayrollComponentTypeEnum,
  ComponentRequestSchema,
  ComponentListResponseSchema,
  AddComponentFormSchema,
};
