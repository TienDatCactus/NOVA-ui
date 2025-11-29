import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff/staff";
import type { StaffListParams } from "~/services/api/staff/staff/staff.types";
import type {
  CreateStaffDto,
  UpdateStaffDto,
  TerminateStaffDto,
} from "~/services/api/staff/staff/dto";
import { toast } from "sonner";

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
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi tạo nhân sự");
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
      toast.success("Kết thúc hợp đồng nhân sự thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi kết thúc hợp đồng nhân sự");
    },
  });
}
