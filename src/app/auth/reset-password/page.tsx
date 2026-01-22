"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useResetPassword, parseErrorMessage } from "@/hooks/useAuth";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "@/lib/validations/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import AuthLeftPanel from "../AuthLeftPanel";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: ResetPasswordSchemaType) => {
    resetMutation.mutate(
      {
        email: values.email,
        otp: values.otp,
        new_password: values.new_password,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successful!");
          router.push("/auth/login");
        },
        onError: (error) => {
          const message = parseErrorMessage(error);
          toast.error(message);
          setError("root", { message });
        },
      }
    );
  };

  return (
    <>
      <AuthLeftPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md">
          <div className="text-right mb-8">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter the OTP and your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input type="email" {...register("email")} disabled />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">OTP</label>
              <Input
                type="text"
                placeholder="Enter OTP"
                {...register("otp")}
                error={!!errors.otp}
              />
              {errors.otp && (
                <p className="text-sm text-red-500">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                New Password
              </label>
              <Input
                type="password"
                placeholder="New password"
                {...register("new_password")}
                error={!!errors.new_password}
              />
              {errors.new_password && (
                <p className="text-sm text-red-500">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm password"
                {...register("confirm_password")}
                error={!!errors.confirm_password}
              />
              {errors.confirm_password && (
                <p className="text-sm text-red-500">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <p className="text-sm text-red-600 text-left mt-2">
                {errors.root.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
