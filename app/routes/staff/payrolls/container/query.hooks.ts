import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import type {
  PayrollGridParams,
  GeneratePayrollDto,
  GenerateSinglePayrollDto,
  UpdatePayrollDto,
  ApplyUnusedLeaveDto,
  PayrollComponentInputDto,
} from "~/services/api/staff/staff-payroll/dto";
import { toast } from "sonner";

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
export function usePayrollDetail(id?: string) {
  return useQuery({
    queryKey: ["payroll-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Payroll ID is required");
      return await StaffPayrollService.getPayrollDetail(id);
    },
    enabled: !!id,
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
    },
  });
}

/**
 * Hook cập nhật bảng lương (lương cơ bản, số tiền đã trả)
 */
export function useUpdatePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePayrollDto }) =>
      await StaffPayrollService.updatePayroll(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({
        queryKey: ["payroll-detail", variables.id],
      });
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
    },
  });
}

/**
 * Hook khóa bảng lương
 */
export function useLockPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await StaffPayrollService.lockPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-detail", id] });
    },
  });
}

/**
 * Hook mở khóa bảng lương
 */
export function useUnlockPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StaffPayrollService.unlockPayroll(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-detail", id] });
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
      data,
    }: {
      componentId: string;
      data: PayrollComponentInputDto;
    }) => await StaffPayrollService.updateComponent(componentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
    },
  });
}

/**
 * Hook xóa component
 */
export function useDeletePayrollComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ componentId }: { componentId: string }) =>
      await StaffPayrollService.deleteComponent(componentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrolls"] });
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
    },
  });
}
