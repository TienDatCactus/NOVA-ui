import { AxiosError } from "axios";
import { toast } from "sonner";
import http from "~/lib/http";
import STORAGE, { clearStorage, setStorage } from "~/lib/storage";
import useAuthSchema from "~/schema/auth.schema";
import { Auth } from "../url";
import type { LoginDto, LoginResponseDto, ResetPasswordDto } from "./dto";
const { LoginSchema, LoginResponseSchema, ResetPasswordSchema } =
  useAuthSchema();

async function login(data: LoginDto): Promise<LoginResponseDto> {
  try {
    const resp = await http.post(Auth.login, LoginSchema.parse(data));
    const parsedData = LoginResponseSchema.parse(resp.data);
    parsedData.accessToken && setStorage(STORAGE.TOKEN, parsedData.accessToken);
    return parsedData;
  } catch (err) {
    err instanceof AxiosError &&
      toast.error("Đăng nhập thất bại. " + (err.response?.data?.message || ""));
    return Promise.reject(err);
  }
}
const logout = () => {
  clearStorage();
};
const forgotPassword = async (email: string) => {
  try {
    const resp = await http.post(Auth.forgotPassword, { email });
    return resp.data;
  } catch (err) {
    err instanceof AxiosError &&
      toast.error("Đăng nhập thất bại. " + (err.response?.data?.message || ""));
    return Promise.reject(err);
  }
};
const resetPassword = async (data: ResetPasswordDto) => {
  try {
    const resp = await http.post(
      Auth.resetPassword,
      ResetPasswordSchema.parse(data)
    );

    return resp.data;
  } catch (err) {
    err instanceof AxiosError &&
      toast.error("Đăng nhập thất bại. " + (err.response?.data?.message || ""));
    return Promise.reject(err);
  }
};
export const AuthService = { forgotPassword, resetPassword, login, logout };
