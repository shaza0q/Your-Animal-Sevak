import { api } from "@/lib/api";

export interface ForgotPasswordResponse {
  message: string;
  /** Present only outside production (no email provider configured). */
  devToken?: string;
}

export const requestPasswordReset = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const res = await api.post<ForgotPasswordResponse>("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (params: {
  email: string;
  token: string;
  password: string;
}): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/auth/reset-password", params);
  return res.data;
};
