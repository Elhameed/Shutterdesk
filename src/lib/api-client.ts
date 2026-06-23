import axios from "axios";
import { ROUTES } from "@/constants/routes";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("shutterdesk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isAuthRequest =
        requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      if (!isAuthRequest) {
        localStorage.removeItem("shutterdesk_token");
        localStorage.removeItem("shutterdesk_role");
        localStorage.removeItem("shutterdesk_remember");

        if (window.location.pathname !== ROUTES.login) {
          window.location.assign(ROUTES.login);
        }
      }
    }

    return Promise.reject(error);
  },
);
