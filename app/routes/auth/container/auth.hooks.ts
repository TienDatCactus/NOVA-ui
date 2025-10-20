import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { DASHBOARD, AUTH } from "~/lib/fe-url";
import { AuthService } from "~/services/api/auth";
import type { LoginDto, ResetPasswordDto } from "~/services/api/auth/dto";
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
      navigate(DASHBOARD.reservation.index);
      return response;
    } catch (err: any) {
      setError(err.message);
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
      navigate(AUTH.resetPassword, {
        state: {
          email,
        },
      });
      return response;
    } catch (err: any) {
      setError(err.message);
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
      navigate(AUTH.login, {
        state: { email: data.email },
      });
      return response;
    } catch (err: any) {
      setError(err.message);
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
