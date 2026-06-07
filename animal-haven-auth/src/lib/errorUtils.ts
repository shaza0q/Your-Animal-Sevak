import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

type ServerData = { message?: string; errors?: Record<string, string[]> };

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ServerData | undefined;

    if (status === 400 && data?.errors) {
      const fieldMessages = Object.entries(data.errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
        .join(" | ");
      return {
        message: fieldMessages || data.message || "Validation failed",
        errors: data.errors,
        status,
      };
    }
    if (status === 401)
      return {
        message: "Your session has expired. Please sign in again.",
        status,
      };
    if (status === 403)
      return {
        message: "You do not have permission to perform this action.",
        status,
      };
    if (status === 404)
      return {
        message: data?.message || "The requested resource was not found.",
        status,
      };
    if (status === 409)
      return {
        message:
          data?.message || "A conflict occurred. Check for duplicates.",
        status,
      };
    if (status && status >= 500)
      return {
        message: "Something went wrong on our end. Please try again.",
        status,
      };
    if (!error.response)
      return {
        message:
          "Could not connect to the server. Check your connection.",
        status: 0,
      };
    return {
      message: data?.message || "An unexpected error occurred.",
      status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "An unexpected error occurred." };
};

export const getErrorMessage = (error: unknown): string =>
  parseApiError(error).message;
