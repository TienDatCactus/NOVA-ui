import z from "zod";
import { PaymentSchema } from "~/services/schema/payment.schema";

const ExpenseCategoryEnum = z.enum([
  "Procurement",
  "Salary",
  "Utilities",
  "Maintenance",
  "Marketing",
  "Office",
  "Other",
]);

const ExpenseStatusEnum = z.enum(["Draft", "Posted", "Voided"]);

const ExpenseSourceTypeEnum = z.enum([
  "Manual",
  "StaffPayroll",
  "Procurement",
  "OtherModule",
]);

//*-------------------------------------

const ExpenseListItemSchema = z.object({
  id: z.string(),
  category: ExpenseCategoryEnum,
  categoryName: z.string(),
  amount: z.number(),
  expenseDate: z.string(),
  description: z.string(),
  paymentMethod: PaymentSchema.PaymentMethodEnum.catch("Unknown"),
  paymentMethodName: z.string(),
  receiptNumber: z.string(),
  createdAt: z.string(),
  createdBy: z.string().nullable(),
  status: ExpenseStatusEnum,
  sourceType: ExpenseSourceTypeEnum,
});

const ExpenseListResponseSchema = z.array(ExpenseListItemSchema);

const CreateExpenseRequestSchema = z.object({
  category: ExpenseCategoryEnum,
  amount: z.number().positive(),
  expenseDate: z.string(),
  description: z.string(),
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  receiptNumber: z.string(),
});

const UpdateExpenseRequestSchema = CreateExpenseRequestSchema;
const ExpenseDetailResponseSchema = ExpenseListItemSchema;

const ExpenseSummaryResponseSchema = z.object({
  totalAmount: z.number(),
  byCategory: z.object({
    Procurement: z.number(),
    Salary: z.number(),
    Utilities: z.number(),
    Maintenance: z.number(),
    Marketing: z.number(),
    Office: z.number(),
    Other: z.number(),
  }),
  byMonth: z.record(z.string(), z.number()),
});

export const ExpenseSchema = {
  ExpenseCategoryEnum,
  ExpenseListItemSchema,
  ExpenseListResponseSchema,
  CreateExpenseRequestSchema,
  UpdateExpenseRequestSchema,
  ExpenseDetailResponseSchema,
  ExpenseSummaryResponseSchema,
};
