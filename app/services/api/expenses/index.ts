import { Expenses } from "~/services/url";
import type {
  ExpenseDetailResponseDto,
  ExpenseListResponseDto,
  ExpenseSummaryResponseDto,
} from "./dto";
import { ExpenseSchema } from "./expenses.schema";
import type { ExpenseListParams } from "./expenses.types";
import http from "~/lib/http";

const {
  CreateExpenseRequestSchema,
  ExpenseCategoryEnum,
  ExpenseDetailResponseSchema,
  ExpenseListItemSchema,
  ExpenseListResponseSchema,
  ExpenseSummaryResponseSchema,
  UpdateExpenseRequestSchema,
} = ExpenseSchema;

async function getExpenses(
  params: ExpenseListParams
): Promise<ExpenseListResponseDto> {
  try {
    const resp = await http.get(Expenses.list, { params });
    return ExpenseListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getExpenseDetail(
  expenseId: string
): Promise<ExpenseDetailResponseDto> {
  try {
    const resp = await http.get(Expenses.detail(expenseId));
    return ExpenseDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createExpense(data: unknown): Promise<void> {
  try {
    const parsedData = CreateExpenseRequestSchema.parse(data);
    await http.post(Expenses.create, parsedData);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateExpense(expenseId: string, data: unknown): Promise<void> {
  {
    try {
      const parsedData = UpdateExpenseRequestSchema.parse(data);
      await http.put(Expenses.update(expenseId), parsedData);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
async function deleteExpense(expenseId: string): Promise<void> {
  try {
    await http.delete(Expenses.delete(expenseId));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getExpenseSummary(
  params: ExpenseListParams
): Promise<ExpenseSummaryResponseDto> {
  try {
    const resp = await http.get(Expenses.summary, {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return ExpenseSummaryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ExpensesService = {
  getExpenses,
  getExpenseDetail,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};
