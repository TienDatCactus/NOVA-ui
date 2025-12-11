import http from "~/lib/http";
import { Expenses } from "~/services/url";
import type {
  ExpenseDetailResponseDto,
  ExpenseListResponseDto,
  ExpenseSummaryResponseDto,
} from "./dto";
import { ExpenseSchema } from "./expenses.schema";
import type { ExpenseListParams } from "./expenses.types";

const {
  CreateExpenseRequestSchema,
  ExpenseDetailResponseSchema,
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
    const resp = await http.post(Expenses.create, parsedData);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateExpense(expenseId: string, data: unknown): Promise<void> {
  {
    try {
      const parsedData = UpdateExpenseRequestSchema.parse(data);
      const resp = await http.put(Expenses.update(expenseId), parsedData);
      return resp.data;
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }
}
async function deleteExpense(expenseId: string): Promise<void> {
  try {
    const resp = await http.delete(Expenses.delete(expenseId));
    return resp.data;
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

async function postExpense(id: string) {
  try {
    await http.post(Expenses.post(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function voidExpense(id: string) {
  try {
    await http.post(Expenses.void(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const ExpensesService = {
  postExpense,
  voidExpense,
  getExpenses,
  getExpenseDetail,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
};
