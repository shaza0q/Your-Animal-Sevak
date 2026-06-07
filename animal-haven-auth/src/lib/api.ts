import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../cache";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }
    // Re-throw the original AxiosError so parseApiError can inspect it
    return Promise.reject(error);
  },
);
