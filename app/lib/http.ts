import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { AuthService } from "~/services/auth-service";
import STORAGE, { clearStorage, getStorage } from "./storage";

const parseBody = (response: AxiosResponse) => {
  const { status, message } = response.data;
  if (status >= 500) {
    toast.error("Something went wrong on our end. Please try again later.");
  }
  if (status < 500 && status !== 200) {
    toast.error(message || "An error occurred, please try again later.");
  }

  return response;
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  withCredentials: false,
});

http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getStorage(STORAGE.TOKEN);
    token && (config.headers.Authorization = `Bearer ${token}`);
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use((response) => parseBody(response));

export default http;
