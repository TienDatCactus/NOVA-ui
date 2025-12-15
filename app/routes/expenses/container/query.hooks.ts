import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpensesService } from "~/services/api/expenses";
import type { ExpenseListParams } from "~/services/api/expenses/expenses.types";
import type {
  CreateExpenseRequestDto,
  UpdateExpenseRequestDto,
} from "~/services/api/expenses/dto";
import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Get list of expenses with filters
 */
export function useExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: async () => {
      const queryParams = params || ({} as ExpenseListParams);
      return await ExpensesService.getExpenses(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get single expense detail
 */
export function useExpenseDetail(id: string, options?: { enabled: boolean }) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => await ExpensesService.getExpenseDetail(id),
    enabled: !!options?.enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get expense summary statistics
 */
export function useExpenseSummary(params?: ExpenseListParams) {
  return useQuery({
    queryKey: ["expenses-summary", params],
    queryFn: async () => {
      const queryParams = params || ({} as ExpenseListParams);
      return await ExpensesService.getExpenseSummary(queryParams);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create new expense mutation
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseRequestDto) =>
      await ExpensesService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Tạo chi phí thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message || "Lỗi khi tạo chi phí");
    },
  });
}

/**
 * Update expense mutation
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExpenseRequestDto;
    }) => await ExpensesService.updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Cập nhật chi phí thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message || "Lỗi khi cập nhật chi phí"
        );
    },
  });
}

/**
 * Delete expense mutation
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await ExpensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Xóa chi phí thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message || "Lỗi khi xóa chi phí");
    },
  });
}

/**
 * Post expense mutation (Draft → Posted)
 */
export function usePostExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await ExpensesService.postExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Chốt chi phí thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message || "Lỗi khi chốt chi phí");
    },
  });
}

/**
 * Void expense mutation (Posted → Voided)
 */
export function useVoidExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await ExpensesService.voidExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-summary"] });
      toast.success("Hủy chi phí thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data?.message || "Lỗi khi hủy chi phí");
    },
  });
}
