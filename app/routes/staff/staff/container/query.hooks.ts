import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff/staff";
import type { StaffListParams } from "~/services/api/staff/staff/staff.types";
import type {
  CreateStaffDto,
  UpdateStaffDto,
  TerminateStaffDto,
  RehireStaffDto,
} from "~/services/api/staff/staff/dto";
import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Hook to fetch staff list
 */
export function useStaffList(params?: StaffListParams) {
  return useQuery({
    queryKey: ["staffs", params],
    queryFn: async () => await StaffService.getStaffList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

/**
 * Hook to fetch staff detail by ID
 */
export function useStaffDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      if (!id) throw new Error("Staff ID is required");
      return await StaffService.getStaffById(id);
    },
    enabled: options?.enabled ?? !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create new staff
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStaffDto) =>
      await StaffService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffs"],
        refetchType: "active",
      });
      toast.success("Tạo nhân sự thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi tạo nhân sự");
      }
    },
  });
}

/**
 * Hook to update staff
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStaffDto }) =>
      await StaffService.updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", variables.id],
        refetchType: "active",
      });
      toast.success("Cập nhật nhân sự thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi cập nhật nhân sự");
      }
    },
  });
}

/**
 * Hook to delete staff
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await StaffService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffs"],
        refetchType: "active",
      });
      toast.success("Xóa nhân sự thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi xóa nhân sự");
      }
    },
  });
}

/**
 * Hook to terminate staff
 */
export function useTerminateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TerminateStaffDto }) =>
      await StaffService.terminateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", variables.id],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-shifts"],
      });
      toast.success("Cho nghỉ việc nhân sự thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Lỗi khi Cho nghỉ việc nhân sự",
        );
      }
    },
  });
}

export function useStaffsHasPayrollinMonth(year: number, month: number) {
  return useQuery({
    queryKey: ["staffs-has-payroll", year, month],
    queryFn: async () =>
      await StaffService.getStaffsHasPayrollinMonth(year, month),
    enabled: !!year && !!month,
  });
}

/**
 * Hook to rehire staff
 */
export function useRehireStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RehireStaffDto }) =>
      await StaffService.rehireStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["staffs"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", variables.id.toString()],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-attendance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff-shifts"],
      });
      toast.success("Tái tuyển dụng nhân sự thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Lỗi khi tái tuyển dụng nhân sự",
        );
      }
    },
  });
}
