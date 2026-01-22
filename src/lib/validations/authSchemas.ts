import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^(?!.* {2})[A-Za-z0-9 !@#$%^&*()_\-+=.,:;'"?/\\|{}[\]~`]+$/, "Invalid username"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include one uppercase letter")
    .regex(/[0-9]/, "Must include one number"),
});

export type SignupSchemaType = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^(?!.* {2})[A-Za-z0-9 !@#$%^&*()_\-+=.,:;'"?/\\|{}[\]~`]+$/, "Invalid username"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6, "OTP must be at least 6 characters"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include one uppercase letter")
      .regex(/[0-9]/, "Must include one number"),
    confirm_password: z.string().min(8, "Confirm password must match"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export const passwordSchema = z
  .object({
    current_password: z
      .string()
      .min(8, "Current password must be at least 8 characters"),

    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[0-9]/, "New password must contain at least one number"),

    confirm_password: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type PasswordSchemaType = z.infer<typeof passwordSchema>;
