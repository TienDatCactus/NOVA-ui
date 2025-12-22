import { z } from "zod";
import { StaffPayrollSchema } from "~/services/api/staff/staff-payroll/staff-payroll.schema";

const {
  PayrollItemSchema,
  PayrollDetailSchema,
  PayrollListSchema,
  PayrollComponentSchema,
  PayrollComponentListSchema,
  GeneratePayrollSchema,
  GenerateSinglePayrollSchema,
  ApplyUnusedLeaveSchema,
  PayrollComponentInputSchema,
  PayrollComponentTypeEnum,
  CreateSalaryExpenseRequestSchema,
  UpdateBaseSalaryPayrollSchema,
  UpdatePaidAmountPayrollSchema,
} = StaffPayrollSchema;

// DTOs (consistent naming with Dto suffix)
export type PayrollItemDto = z.infer<typeof PayrollItemSchema>;
export type PayrollComponentDto = z.infer<typeof PayrollComponentSchema>;
export type PayrollDetailDto = z.infer<typeof PayrollDetailSchema>;
export type PayrollListDto = z.infer<typeof PayrollListSchema>;
export type PayrollComponentListDto = z.infer<
  typeof PayrollComponentListSchema
>;

// Input DTOs
export type GeneratePayrollDto = z.infer<typeof GeneratePayrollSchema>;
export type GenerateSinglePayrollDto = z.infer<
  typeof GenerateSinglePayrollSchema
>;
export type ApplyUnusedLeaveDto = z.infer<typeof ApplyUnusedLeaveSchema>;
export type UpdatePaidAmountPayrollDto = z.infer<
  typeof UpdatePaidAmountPayrollSchema
>;
export type UpdateBaseSalaryPayrollDto = z.infer<
  typeof UpdateBaseSalaryPayrollSchema
>;
export type PayrollComponentInputDto = z.infer<
  typeof PayrollComponentInputSchema
>;

// Enums
export type PayrollComponentType = z.infer<typeof PayrollComponentTypeEnum>;

export const PayrollGridParamsSchema = z.object({
  year: z.number().optional(),
  month: z.number().optional(),
});

export type PayrollGridParams = z.infer<typeof PayrollGridParamsSchema>;

export type CreateSalaryExpenseRequestDto = z.infer<
  typeof CreateSalaryExpenseRequestSchema
>;
