import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { DASHBOARD, AUTH } from "~/lib/fe-url";
import { AuthService } from "~/services/api/auth";
import type {
  ChangePasswordDto,
  LoginDto,
  ResetPasswordDto,
} from "~/services/api/auth/dto";
import { useAuthStore } from "~/store/auth.store";

export function useAuth() {
  const navigate = useNavigate();
  const { setUser, clearUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginDto) => {
      const response = await AuthService.login(data);
      return response;
    },
    onSuccess: (response) => {
      setUser(response.user);
      if (response.user.roles.includes("Admin")) {
        navigate(DASHBOARD.auditLogs);
      } else if (response.user.roles.includes("HotelManager")) {
        navigate(DASHBOARD.finances.dashboard);
      } else if (response.user.roles.includes("ServiceStaff")) {
        navigate(DASHBOARD.rooms.list);
      } else {
        navigate(DASHBOARD.bookings.list);
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await AuthService.forgotPassword(email);
      return { response, email };
    },
    onSuccess: ({ email }) => {
      navigate(AUTH.resetPassword, {
        state: { email },
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordDto) => {
      const response = await AuthService.resetPassword(data);
      return { response, email: data.email };
    },
    onSuccess: ({ email }) => {
      navigate(AUTH.login, {
        state: { email },
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordDto) => {
      const response = await AuthService.changePassword(data);
      return { response };
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
