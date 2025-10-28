import http from "~/lib/http";
import STORAGE, { clearStorage, getStorage, setStorage } from "~/lib/storage";
import useAuthSchema from "~/services/schema/auth.schema";
import { Auth } from "../../url";
import type { LoginDto, LoginResponseDto, ResetPasswordDto } from "./dto";
const { LoginSchema, LoginResponseSchema, ResetPasswordSchema } =
  useAuthSchema();

async function login(data: LoginDto): Promise<LoginResponseDto> {
  try {
    const resp = await http.post(Auth.login, LoginSchema.parse(data));
    const parsedData = LoginResponseSchema.parse(resp.data);
    parsedData.accessToken && setStorage(STORAGE.TOKEN, parsedData.accessToken);
    parsedData.refreshToken &&
      setStorage(STORAGE.REFRESH_TOKEN, parsedData.refreshToken);
    return parsedData;
  } catch (err) {
    return Promise.reject(err);
  }
}
function logout() {
  clearStorage();
}
async function forgotPassword(email: string) {
  try {
    const resp = await http.post(Auth.forgotPassword, { email });
    return resp.data;
  } catch (err) {
    return Promise.reject(err);
  }
}
async function resetPassword(data: ResetPasswordDto) {
  try {
    const resp = await http.post(
      Auth.resetPassword,
      ResetPasswordSchema.parse(data)
    );
    if (resp.status === 200) {
      const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);
      await revoke(refreshToken);
    }
    return resp.data;
  } catch (err) {
    return Promise.reject(err);
  }
}

async function refresh(refreshToken: string) {
  try {
    const resp = await http.post(Auth.refresh, { refreshToken });
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}
async function revoke(refreshToken: string) {
  try {
    const resp = await http.post(Auth.revoke, { refreshToken });
    return resp.data;
  } catch (error) {
    console.error(error);
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
