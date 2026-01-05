import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import type {
  ApplyUnusedLeaveDto,
  CreateSalaryExpenseRequestDto,
  GeneratePayrollDto,
  GenerateSinglePayrollDto,
  PayrollComponentInputDto,
  PayrollGridParams,
  UpdatePaidAmountPayrollDto,
} from "~/services/api/staff/staff-payroll/dto";

/**
 * Hook lấy danh sách bảng lương theo tháng/năm
 */
export function usePayrolls(params?: PayrollGridParams) {
  return useQuery({
    queryKey: ["payrolls", params?.year, params?.month],
    queryFn: async () => await StaffPayrollService.getPayrollGrid(params),
    enabled: Boolean(params?.year && params?.month),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook lấy chi tiết 1 bảng lương
 */
export function usePayrollDetail(
  id: string,
  options: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["payroll-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Payroll ID is required");
      return await StaffPayrollService.getPayrollDetail(id);
    },
    enabled: options.enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook lấy danh sách components của bảng lương
 */
export function usePayrollComponents(payrollId?: string) {
  return useQuery({
    queryKey: ["payroll-components", payrollId],
    queryFn: async () => {
      if (!payrollId) throw new Error("Payroll ID is required");
      return await StaffPayrollService.getComponents(payrollId);
    },
    enabled: !!payrollId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook tạo bảng lương cho tất cả nhân viên
 */
export function useGeneratePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GeneratePayrollDto) =>
      await StaffPayrollService.generatePayroll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payrolls", variables.year, variables.month],
      });
      toast.success("Tạo bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data?.message || "Lỗi khi tạo bảng lương");
    },
  });
}

/**
 * Hook tạo bảng lương cho 1 nhân viên
 */
export function useGenerateSinglePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      staffId,
      data,
    }: {
      staffId: string;
      data: GenerateSinglePayrollDto;
    }) => await StaffPayrollService.generateSinglePayroll(staffId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payrolls", variables.data.year, variables.data.month],
      });
      toast.success("Tạo bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data?.message || "Lỗi khi tạo bảng lương");
    },
  });
}

/**
 * Hook cập nhật bảng lương (lương cơ bản, số tiền đã trả)
 */
export function useUpdatePaidAmountPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaidAmountPayrollDto;
    }) => await StaffPayrollService.updatePaidAmountPayroll(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.id],
      });
      toast.success("Cập nhật bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message || "Lỗi khi cập nhật bảng lương"
        );
    },
  });
}

/**
 * Hook áp dụng chế độ nghỉ phép chưa sử dụng (PayOut / CarryOver)
 */
export function useApplyUnusedLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ApplyUnusedLeaveDto;
    }) => await StaffPayrollService.applyUnusedLeave(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.id],
      });
      toast.success("Áp dụng chế độ nghỉ phép thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi áp dụng chế độ nghỉ phép chưa sử dụng"
        );
    },
  });
}

/**
 * Hook thêm component vào bảng lương (phụ cấp/khấu trừ)
 */
export function useAddPayrollComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payrollId,
      data,
    }: {
      payrollId: string;
      data: PayrollComponentInputDto;
    }) => await StaffPayrollService.addComponent(payrollId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.payrollId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-components", variables.payrollId],
      });
      toast.success("Thêm component vào bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi thêm component vào bảng lương"
        );
    },
  });
}

/**
 * Hook cập nhật component
 */
export function useUpdatePayrollComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      componentId,
      //@ts-ignore
      payrollId,
      data,
    }: {
      componentId: string;
      payrollId: string;
      data: PayrollComponentInputDto;
    }) => await StaffPayrollService.updateComponent(componentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.payrollId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-components", variables.payrollId],
      });
      toast.success("Đã cập nhật component bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi cập nhật component bảng lương"
        );
    },
  });
}

/**
 * Hook xóa component
 */
export function useDeletePayrollComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      componentId,
      //@ts-ignore
      payrollId,
    }: {
      componentId: string;
      payrollId?: string;
    }) => await StaffPayrollService.deleteComponent(componentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.payrollId],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-components", variables.payrollId],
      });
      toast.success("Đã xóa component bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message || "Lỗi khi xóa component bảng lương"
        );
    },
  });
}

/**
 * Hook làm mới số ngày công (refresh days)
 */
export function useRefreshPayrollDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { year: number; month: number }) =>
      await StaffPayrollService.refreshDays(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payrolls", variables.year, variables.month],
      });
      toast.success("Đã làm mới số ngày công thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message || "Lỗi khi làm mới số ngày công"
        );
    },
  });
}

/**
 * Hook làm mới số ngày công cho 1 bảng lương
 */
export function useRefreshSinglePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StaffPayrollService.refreshSinglePayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-detail", id] });
      toast.success("Đã làm mới số ngày công bảng lương thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi làm mới số ngày công bảng lương"
        );
    },
  });
}

/**
 * Hook tạo phiếu chi lương
 */
export function useCreateSalaryExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payrollId,
      data,
    }: {
      payrollId: string;
      data: CreateSalaryExpenseRequestDto;
    }) => await StaffPayrollService.createSalaryExpense(payrollId, data),
    onSuccess: (_, variables) => {
      toast.success("Tạo phiếu chi lương thành công");
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.payrollId],
      });
      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Không thể tạo phiếu chi lương. Vui lòng thử lại."
        );
    },
  });
}

export function useExportPayslips(payrollId: string) {
  return useMutation({
    mutationFn: async () => await StaffPayrollService.exportPayslip(payrollId),
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Không thể tạo phiếu chi lương. Vui lòng thử lại."
        );
    },
  });
}

export function useExportMonthlyPayroll(year: number, month: number) {
  return useMutation({
    mutationFn: async () =>
      await StaffPayrollService.exportMonthly({
        year: year,
        month: month || new Date().getMonth() + 1,
      }),
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data?.message ||
            "Không thể xuất phiếu chi lương. Vui lòng thử lại."
        );
    },
  });
}
