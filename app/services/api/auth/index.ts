import axios, { AxiosError } from "axios";
import STORAGE, { clearStorage, getStorage, setStorage } from "~/lib/storage";
import { AuthSchema } from "~/services/api/auth/auth.schema";
import { Auth } from "../../url";
import type { LoginDto, LoginResponseDto, ResetPasswordDto } from "./dto";
import { toast } from "sonner";
const { LoginSchema, LoginResponseSchema, ResetPasswordSchema } = AuthSchema;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
async function login(data: LoginDto): Promise<LoginResponseDto> {
  try {
    const resp = await axios.post(Auth.login, LoginSchema.parse(data));
    console.log(resp.data);
    const parsedData = LoginResponseSchema.parse(resp.data.data);
    parsedData.accessToken && setStorage(STORAGE.TOKEN, parsedData.accessToken);
    parsedData.refreshToken &&
      setStorage(STORAGE.REFRESH_TOKEN, parsedData.refreshToken);
    return parsedData;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(
        err.response?.data.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    }
    console.error(err);
    return Promise.reject(err);
  }
}
function logout() {
  clearStorage();
}
async function forgotPassword(email: string) {
  try {
    const resp = await axios.post(Auth.forgotPassword, { email });
    return resp.data.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(
        err.response?.data.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    }
    console.error(err);
    return Promise.reject(err);
  }
}
async function resetPassword(data: ResetPasswordDto) {
  try {
    const resp = await axios.post(
      Auth.resetPassword,
      ResetPasswordSchema.parse(data)
    );
    if (resp.status === 200) {
      const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);
      await revoke(refreshToken);
    }
    return resp.data.data;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function refresh(refreshToken: string) {
  try {
    const resp = await axios.post(Auth.refresh, { refreshToken });
    return resp.data.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(
        err.response?.data.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    }
    console.error(err);
    throw Promise.reject(err);
  }
}
async function revoke(refreshToken: string) {
  try {
    const resp = await axios.post(Auth.revoke, { refreshToken });
    return resp.data.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      toast.error(
        err.response?.data.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    }
    console.error(err);
    throw Promise.reject(err);
  }
}
export const AuthService = {
  forgotPassword,
  resetPassword,
  login,
  logout,
  refresh,
  revoke,
};
