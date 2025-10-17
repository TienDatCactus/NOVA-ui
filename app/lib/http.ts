import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { success } from "zod";
import { AuthService } from "~/services/api/auth";
import STORAGE, { clearStorage, getStorage, setStorage } from "./storage";

const parseBody = (response: AxiosResponse) => {
  const { message } = response.data;
  if (message) {
    if (!success) {
      toast.error(message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } else {
      toast.success(message);
    }
  }
  return response.data;
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  withCredentials: true,
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStorage(STORAGE.TOKEN);
    token && (config.headers.Authorization = `Bearer ${token}`);
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};
http.interceptors.response.use(
  (response) => parseBody(response),
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return http(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);
        const rs = await AuthService.refresh(refreshToken);
        const { accessToken } = rs.data;
        setStorage(STORAGE.TOKEN, accessToken);
        http.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return http(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearStorage();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default http;
