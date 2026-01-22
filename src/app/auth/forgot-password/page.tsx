"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForgotPassword, parseErrorMessage } from "@/hooks/useAuth";
import {
  forgotPasswordSchema,
  ForgotPasswordSchemaType,
} from "@/lib/validations/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import AuthLeftPanel from "../AuthLeftPanel";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordSchemaType) => {
    forgotMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success(data.message);
        router.push(`/auth/reset-password?email=${values.email}`);
      },
      onError: (error) => {
        const message = parseErrorMessage(error);
        toast.error(message);
        setError("root", { message });
      },
    });
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
            <h1 className="text-3xl font-semibold mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              We’ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="john@email.com"
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
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
              disabled={forgotMutation.isPending}
              className="w-full"
            >
              {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
