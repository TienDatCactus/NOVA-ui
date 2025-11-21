import type { z } from "zod";
import { StaffPayrollSchema } from "~/services/api/staff-payroll/staff-payroll.schema";

const {
  PayrollItemSchema,
  PayrollDetailResponseSchema,
  PayrollGridListResponseSchema,
  GeneratePayrollRequestSchema,
  GenerateSinglePayrollRequestSchema,
  ApplyUnusedLeaveRequestSchema,
  UpdatePayrollRequestSchema,
  PayrollComponentSchema,
  ComponentRequestSchema,
  ComponentListResponseSchema,
  PayrollComponentTypeEnum,
} = StaffPayrollSchema;

// Types
export type PayrollItem = z.infer<typeof PayrollItemSchema>;
export type PayrollComponent = z.infer<typeof PayrollComponentSchema>;
export type PayrollDetailResponse = z.infer<typeof PayrollDetailResponseSchema>;
export type PayrollGridListResponse = z.infer<
  typeof PayrollGridListResponseSchema
>;
export type GeneratePayrollRequest = z.infer<
  typeof GeneratePayrollRequestSchema
>;
export type GenerateSinglePayrollRequest = z.infer<
  typeof GenerateSinglePayrollRequestSchema
>;
export type ApplyUnusedLeaveRequest = z.infer<
  typeof ApplyUnusedLeaveRequestSchema
>;
export type UpdatePayrollRequest = z.infer<typeof UpdatePayrollRequestSchema>;
export type ComponentRequest = z.infer<typeof ComponentRequestSchema>;
export type ComponentListResponse = z.infer<typeof ComponentListResponseSchema>;
export type PayrollComponentType = z.infer<typeof PayrollComponentTypeEnum>;

// Query params for grid list
export interface PayrollGridParams {
  year?: number;
  month?: number;
}
