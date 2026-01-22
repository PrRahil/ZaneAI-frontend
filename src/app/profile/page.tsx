"use client";

import Navigation from "@/components/layout/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Key, Mail, User } from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  passwordSchema,
  PasswordSchemaType,
} from "@/lib/validations/authSchemas";
import { parseErrorMessage, useChangePassword } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordSchemaType>({
    resolver: zodResolver(passwordSchema),
  });

  const changePasswordMutation = useChangePassword();
  const changePassword = (values: PasswordSchemaType) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Password updated successfully!");
        reset();
      },
      onError: (err) => {
        const message = parseErrorMessage(err);
        toast.error(message);
        setError("root", { message });
      },
    });
  };

  const avatarSrc = "/mnt/data/02afed23-13dd-4cfd-a381-64590722e701.png";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            View your account information and update your password.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback>
                    {user?.username?.slice(0, 2).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <p className="text-lg font-semibold">{user?.username}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>

                <p className="text-sm text-muted-foreground">
                  This information is managed by your administrator and cannot
                  be edited.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(changePassword)}
                className="space-y-5 max-w-lg"
              >
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    {...register("current_password")}
                  />
                  {errors.current_password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.current_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...register("new_password")}
                  />
                  {errors.new_password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.new_password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...register("confirm_password")}
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500 mt-1">
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
                  disabled={changePasswordMutation.isPending}
                  className="gap-2"
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
