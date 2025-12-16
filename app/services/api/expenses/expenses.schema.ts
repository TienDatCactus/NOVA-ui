import z from "zod";
import { PaymentSchema } from "~/services/schema/payment.schema";

const ExpenseCategoryEnum = z.enum(
  [
    "Procurement",
    "Salary",
    "Utilities",
    "Maintenance",
    "Marketing",
    "Office",
    "Other",
  ],
  "Danh mục chi tiêu không hợp lệ"
);

const ExpenseStatusEnum = z.enum(["Draft", "Posted", "Voided"]);

const ExpenseSourceTypeEnum = z.enum(
  ["Manual", "StaffPayroll", "Procurement", "OtherModule"],
  "Nguồn vốn chi không hợp lệ"
);

//*-------------------------------------

const ExpenseListItemSchema = z.object({
  id: z.string(),
  category: ExpenseCategoryEnum,
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
  amount: z.number("Số tiền không hợp lệ").positive(" Số tiền phải lớn hơn 0 "),
  expenseDate: z.string(" Ngày chi tiêu không hợp lệ "),
  description: z
    .string(" Mô tả không được để trống ")
    .max(500, " Mô tả tối đa 500 ký tự "),
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  receiptNumber: z
    .string(" Số hóa đơn không hợp lệ ")
    .max(100, " Số hóa đơn tối đa 100 ký tự ")
    .optional(),
});

const UpdateExpenseRequestSchema = CreateExpenseRequestSchema;
const ExpenseDetailResponseSchema = ExpenseListItemSchema;

const ExpenseSummaryResponseSchema = z.object({
  totalAmount: z.number(),
  byCategory: z.object({
    Procurement: z.number(),
    Salary: z.number().optional(),
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
