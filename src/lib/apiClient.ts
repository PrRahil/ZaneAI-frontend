import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const token = Cookies.get("token") ?? localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      const isLoginRequest = error.config.url?.includes("/auth/login");
      const isLoginPage =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/auth/login");

      if (!isLoginRequest && !isLoginPage) {
        Cookies.remove("token");
        useAuthStore.getState().logout();

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;