import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DASHBOARD, AUTH } from "~/lib/fe-url";
import { AuthService } from "~/services/auth-service";
import type { LoginDto, ResetPasswordDto } from "~/services/auth-service/dto";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (data: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(data);
      navigate(DASHBOARD.reservation.index);
      return response;
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    navigate(AUTH.login);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setIsLoading;
      setIsLoading(true);
      setError(null);
      const response = await AuthService.forgotPassword(email);
      toast.success("Yêu cầu thay đổi mật khẩu đã được gửi!");
      navigate(AUTH.verifyOtp);
      return response;
    } catch (error) {
      console.error(error);
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
      setError(err.message || "Failed to reset password.");
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
