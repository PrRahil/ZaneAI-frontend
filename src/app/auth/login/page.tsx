"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLogin, parseErrorMessage } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import { loginSchema, LoginSchemaType } from "@/lib/validations/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLeftPanel from "../AuthLeftPanel";
import toast from "react-hot-toast";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { LayoutSplashScreen } from "@/components/ui/splash-screen";

export default function LoginPage() {
  const router = useRouter();

  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const { token } = useAuthStore();
  useRoleRedirect();

  if (token) {
    return <LayoutSplashScreen />;
  }

  const onSubmit = (values: LoginSchemaType) => {
    loginMutation.mutate(values, {
      onSuccess: async (data) => {
        toast.success("Logged in successfully!");
        // Redirection is handled by the useEffect above once the user is loaded in the store
      },
      onError: (err) => {
        const message = parseErrorMessage(err);
        toast.error(message);
        setError("root", { message });
      },
    });
  };

  return (
    <>
      <AuthLeftPanel />
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-right mb-8">
            <span className="text-sm text-muted-foreground">
              Don’t have an account?{" "}
            </span>
            <Link
              href="/auth/signup"
              className="text-primary text-sm font-medium hover:underline"
            >
              Sign Up
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Welcome to Myzane AI!</h1>
            <p className="text-muted-foreground">
              Sign in to your Myzane AI account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Username
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                error={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                error={!!errors.password}
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full gap-2"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/microsoft`;
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Microsoft
          </Button>

          <div className="mt-4 text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
