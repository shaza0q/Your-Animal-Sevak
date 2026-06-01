import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../../cache";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "Request failed";

    const customError = new Error(errorMessage) as Error & { status?: number; response?: AxiosError['response'] };
    customError.status = error.response?.status;
    customError.response = error.response;

    throw customError;
  }
);
