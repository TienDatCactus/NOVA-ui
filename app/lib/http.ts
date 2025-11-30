import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { AuthService } from "~/services/api/auth";
import STORAGE, { clearStorage, getStorage, setStorage } from "./storage";

const parseBody = (response: AxiosResponse) => {
  const { message, success } = response.data;
  if (message) {
    if (!success) {
      toast.error(message);
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

    const idempotencyKey = config.headers?.["Idempotency-Key"];
    if (
      idempotencyKey &&
      ["post", "put", "patch", "delete"].includes(
        config.method?.toLowerCase() || ""
      )
    ) {
      config.headers["Idempotency-Key"] = idempotencyKey;
    }

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
    const message = error.response?.data?.message;
    const curPath = window.location.pathname;

    // Skip auth redirect for customer/public routes
    const isPublicRoute =
      curPath.startsWith("/chat") ||
      curPath.startsWith("/map") ||
      curPath === "/" ||
      curPath.includes("/auth");

    if (status === 401 && !originalRequest._retry && !isPublicRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorage(STORAGE.REFRESH_TOKEN);

      if (!refreshToken) {
        isRefreshing = false;
        clearStorage();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(new Error("No refresh token available"));
      }

      try {
        const refreshData = await AuthService.refresh(refreshToken);
        let newAccessToken: string | null = null;
        if (refreshData && typeof refreshData === "object") {
          newAccessToken = (refreshData as any).accessToken;
          const newRefreshToken = (refreshData as any).refreshToken;
          if (newAccessToken) {
            setStorage(STORAGE.TOKEN, newAccessToken);
          }
          if (newRefreshToken) {
            setStorage(STORAGE.REFRESH_TOKEN, newRefreshToken);
          }
        }

        // Use new token if available, otherwise try existing token
        const token =
          newAccessToken || getStorage(STORAGE.TOKEN) || refreshToken;

        http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Process queued requests
        processQueue(null, token);

        // Retry original request
        return http(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        processQueue(err, null);
        clearStorage();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    } else if (status && status !== 401) {
      // Only show error toast for non-401 errors (401 is handled above)
      toast.error(message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    }

    return Promise.reject(error);
  }
);
export default http;
