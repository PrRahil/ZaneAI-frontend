"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignup, parseErrorMessage } from "@/hooks/useAuth";
import { signupSchema, SignupSchemaType } from "@/lib/validations/authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLeftPanel from "../AuthLeftPanel";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (values: SignupSchemaType) => {
    signup.mutate(values, {
      onSuccess: () => {
        toast.success("Account created successfully!");
        reset();
        router.push("/auth/login");
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
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-right mb-8">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/auth/login"
              className="text-primary text-sm font-medium hover:underline"
            >
              Sign In
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Please enter your details to sign up your account
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

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="Minimum 8 characters"
                error={!!errors.password}
                {...register("password")}
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
              disabled={signup.isPending}
              className="w-full"
            >
              {signup.isPending ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
