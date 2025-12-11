import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserService } from "~/services/api/user";
import type { UserListParams } from "~/services/api/user/user.types";
import type {
  CreateUserDto,
  UpdateUserDto,
  LockUserDto,
  AssignRolesDto,
  RemoveRolesDto,
  ChangePasswordDto,
} from "~/services/api/user/dto";
import { AxiosError } from "axios";

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: ["users", params ?? {}],
    queryFn: async () => await UserService.getUserList(params ?? {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useUserDetail(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => await UserService.getUserDetail(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => await UserService.getRoleList(),
    staleTime: 60 * 60 * 1000, // 1 hour - roles don't change often
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useChatStaff() {
  return useQuery({
    queryKey: ["users", "chat-staff"],
    queryFn: async () => await UserService.getChatStaff(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserDto) =>
      await UserService.createUser(data),
    onSuccess: () => {
      // Invalidate users list to refetch with new user
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      toast.success("Tạo người dùng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) =>
      await UserService.updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both list and specific user detail
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
      toast.success("Cập nhật người dùng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useLockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LockUserDto }) =>
      await UserService.lockUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
      toast.success("Khóa người dùng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await UserService.unlockUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", id],
        refetchType: "active",
      });
      toast.success("Mở khóa người dùng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignRolesDto }) =>
      await UserService.assignRoles(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
      toast.success("Gán quyền thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useRemoveRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RemoveRolesDto }) =>
      await UserService.removeRoles(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
      toast.success("Xóa quyền thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ChangePasswordDto }) =>
      await UserService.changePassword(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error?.response?.data?.message ||
            "Đã có lỗi xảy ra khi tạo người dùng"
        );
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => await UserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      toast.success("Xóa người dùng thành công");
    },
  });
}
