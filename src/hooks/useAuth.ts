import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import Cookies from "js-cookie";
import {
  SignupInput,
  LoginInput,
  AuthResponse,
  ApiError,
  ResetPasswordInput,
  ForgotPasswordInput,
  ForgotPasswordResponse,
} from "@/types/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { PasswordSchemaType } from "@/lib/validations/authSchemas";

const parseErrorMessage = (error: any): string => {
  if (error?.response?.data) {
    const data = error.response.data as ApiError;
    return data.detail || data.message || data.error || "Something went wrong.";
  }
  if (error?.message) return error.message;
  return "An unexpected error occurred.";
};

export const useSignup = () =>
  useMutation<AuthResponse, ApiError, SignupInput>({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        org_id: "918a196a-d729-4014-873d-16beb5638e4d",
      };
      const res = await apiClient.post("/auth/signup", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Signup error:", parseErrorMessage(error));
    },
  });

export const useLogin = () =>
  useMutation<AuthResponse, ApiError, LoginInput>({
    mutationFn: async (payload) => {
      const res = await apiClient.post<AuthResponse>("/auth/login", payload);
      const body = res.data;

      const token = body?.access_token;
      if (token) {
        useAuthStore.getState().setToken(token);
      }

      return body;
    },
    onError: (error) => {
      console.error("Login error:", parseErrorMessage(error));
    },
  });

export const useForgotPassword = () =>
  useMutation<ForgotPasswordResponse, ApiError, ForgotPasswordInput>({
    mutationFn: async (data) => {
      const res = await apiClient.post("/auth/forgot-password", data);
      return res.data;
    },
    onError: (error) => {
      console.error("Forgot password error:", parseErrorMessage(error));
    },
  });

export const useResetPassword = () =>
  useMutation<AuthResponse, ApiError, ResetPasswordInput>({
    mutationFn: async (data) => {
      const res = await apiClient.post("/auth/reset-password", data);
      return res.data;
    },
    onError: (error) => {
      console.error("Reset password error:", parseErrorMessage(error));
    },
  });

export const useChangePassword = () =>
  useMutation<any, Error, PasswordSchemaType>({
    mutationFn: async (data) => {
      const res = await apiClient.post("/auth/change-password", data);
      return res.data;
    },
    onError: (error) => {
      console.error("Change password error:", parseErrorMessage(error));
    },
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/auth/logout");
      Cookies.remove("token");
      useAuthStore.getState().logout();
      queryClient.removeQueries({ queryKey: ["me"] });
      return res.data?.message || "Logged out successfully";
    },
  });
};

export const useFetchMe = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      if (!token) return null;
      const res = await apiClient.get("/auth/me");
      return res.data;
    },
    enabled: Boolean(useAuthStore.getState().token),
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
  });
};

export { parseErrorMessage };
