import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DASHBOARD, AUTH } from "~/lib/fe-url";
import { AuthService } from "~/services/api/auth-service";
import type {
  LoginDto,
  ResetPasswordDto,
} from "~/services/api/auth-service/dto";
import { useAuthStore } from "~/store/auth.store";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, clearUser } = useAuthStore();
  const login = useCallback(async (data: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(data);
      setUser(response.user);
      toast.success("Đăng nhập thành công!");
      navigate(DASHBOARD.reservation.index);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    navigate(AUTH.login);
    clearUser();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.forgotPassword(email);
      toast.success("Yêu cầu thay đổi mật khẩu đã được gửi!");
      navigate(AUTH.resetPassword);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Gửi yêu cầu thay đổi mật khẩu thất bại.";
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.resetPassword(data);
      toast.success("Thay đổi mật khẩu thành công!");
      navigate(AUTH.login);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Thay đổi mật khẩu thất bại.";
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    resetPassword,
    forgotPassword,
    isLoading,
    error,
  };
}
