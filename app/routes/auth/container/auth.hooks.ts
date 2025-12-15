import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { UserRole } from "~/lib/auth/roles";
import { AUTH, DASHBOARD } from "~/lib/fe-url";
import { AuthService } from "~/services/api/auth";
import type {
  ChangePasswordDto,
  LoginDto,
  ResetPasswordDto,
} from "~/services/api/auth/dto";
import { useAuthStore } from "~/store/auth.store";

export function useAuthHooks() {
  const navigate = useNavigate();
  const { setUser, clearUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await AuthService.login(data);
      return response;
    },
    onSuccess: (response) => {
      toast.success("Đăng nhập thành công.");
      setUser(response.user);
      if (response.user.roles.includes(UserRole.Admin)) {
        navigate(DASHBOARD.auditLogs);
      } else if (response.user.roles.includes(UserRole.HotelManager)) {
        navigate(DASHBOARD.finances.dashboard);
      } else if (response.user.roles.includes(UserRole.ServiceStaff)) {
        navigate(DASHBOARD.rooms.list);
      } else if (response.user.roles.includes(UserRole.Accountant)) {
        navigate(DASHBOARD.expenses);
      } else {
        navigate(DASHBOARD.bookings.list);
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Đặt lại mật khẩu thất bại."
        );
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await AuthService.forgotPassword(email);
      return { response, email };
    },
    onSuccess: ({ email }) => {
      toast.success(
        "Mã xác nhận đã được gửi đến email quản lý. Vui lòng kiểm tra hộp thư."
      );
      navigate(AUTH.resetPassword, {
        state: { email },
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Đặt lại mật khẩu thất bại."
        );
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const response = await AuthService.resetPassword(data);
      return { response, email: data.email };
    },
    onSuccess: ({ email }) => {
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");

      navigate(AUTH.login, {
        state: { email },
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Đặt lại mật khẩu thất bại."
        );
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordDto) => {
      const response = await AuthService.changePassword(data);
      return { response };
    },
    onSuccess: () => {
      AuthService.logout();
      navigate(AUTH.login);
      clearUser();
      toast.success("Vui lòng đăng nhập lại với mật khẩu mới.");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
  });

  const logout = () => {
    AuthService.logout();
    navigate(AUTH.login);
    clearUser();
  };

  return {
    login: loginMutation.mutateAsync,
    logout,
    resetPassword: resetPasswordMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isLoading:
      loginMutation.isPending ||
      forgotPasswordMutation.isPending ||
      resetPasswordMutation.isPending ||
      changePasswordMutation.isPending,
    error:
      loginMutation.error ||
      forgotPasswordMutation.error ||
      resetPasswordMutation.error ||
      changePasswordMutation.error,
  };
}
