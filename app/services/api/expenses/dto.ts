import type z from "zod";
import { ExpenseSchema } from "./expenses.schema";

const {
  CreateExpenseRequestSchema,
  ExpenseCategoryEnum,
  ExpenseDetailResponseSchema,
  ExpenseListItemSchema,
  ExpenseListResponseSchema,
  ExpenseSummaryResponseSchema,
  UpdateExpenseRequestSchema,
} = ExpenseSchema;

export type ExpenseCategoryDto = z.infer<typeof ExpenseCategoryEnum>;
export type ExpenseListItemDto = z.infer<typeof ExpenseListItemSchema>;
export type ExpenseListResponseDto = z.infer<typeof ExpenseListResponseSchema>;
export type CreateExpenseRequestDto = z.infer<
  typeof CreateExpenseRequestSchema
>;
export type UpdateExpenseRequestDto = z.infer<
  typeof UpdateExpenseRequestSchema
>;
export type ExpenseDetailResponseDto = z.infer<
  typeof ExpenseDetailResponseSchema
>;
export type ExpenseSummaryResponseDto = z.infer<
  typeof ExpenseSummaryResponseSchema
>;
