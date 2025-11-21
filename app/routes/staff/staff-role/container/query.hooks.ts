import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StaffRoleService } from "~/services/api/staff/staff-role";
import type {
  CreateStaffRoleDto,
  UpdateStaffRoleDto,
} from "~/services/api/staff/staff-role/dto";

/**
 * Hook để lấy danh sách vai trò nhân sự
 */
export function useStaffRoleList() {
  return useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => await StaffRoleService.getStaffRoleList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy chi tiết vai trò nhân sự
 */
export function useStaffRoleDetail(id: string) {
  return useQuery({
    queryKey: ["staff-role", id],
    queryFn: async () => await StaffRoleService.getStaffRoleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook để tạo vai trò nhân sự mới
 */
export function useCreateStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStaffRoleDto) =>
      await StaffRoleService.createStaffRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Tạo vai trò nhân sự thành công");
    },
    onError: (error) => {
      console.error("Create staff role error:", error);
      toast.error("Không thể tạo vai trò nhân sự");
    },
  });
}

/**
 * Hook để cập nhật vai trò nhân sự
 */
export function useUpdateStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStaffRoleDto;
    }) => await StaffRoleService.updateStaffRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      queryClient.invalidateQueries({ queryKey: ["staff-role", variables.id] });
      toast.success("Cập nhật vai trò nhân sự thành công");
    },
    onError: (error) => {
      console.error("Update staff role error:", error);
      toast.error("Không thể cập nhật vai trò nhân sự");
    },
  });
}

/**
 * Hook để xóa vai trò nhân sự
 */
export function useDeleteStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StaffRoleService.deleteStaffRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
      toast.success("Xóa vai trò nhân sự thành công");
    },
    onError: (error) => {
      console.error("Delete staff role error:", error);
      toast.error("Không thể xóa vai trò nhân sự");
    },
  });
}
