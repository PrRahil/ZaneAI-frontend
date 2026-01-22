// src/types/auth.ts

export interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface SignupInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  is_connection_setup?: boolean;
  missing_connectors?: string[];
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  new_password: string;
}

export interface ForgotPasswordResponse {
  message: string;
  note?: string;
}
