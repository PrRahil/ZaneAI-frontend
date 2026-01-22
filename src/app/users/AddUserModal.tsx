"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { userSchema, UserSchemaType } from "@/lib/validations/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/hooks/useUsers";
import toast from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";
import { parseErrorMessage } from "@/hooks/useAuth";

export default function AddUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<UserSchemaType>({
    resolver: zodResolver(userSchema),
  });

  const { mutate, isPending } = useCreateUser();

  const onSubmit = (values: UserSchemaType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("User created successfully!");
        reset();
        onClose();
      },
      onError: (error: any) => {
        const message = parseErrorMessage(error);
        toast.error(message);
        setError("root", { message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Name
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
            <label className="text-sm font-medium text-foreground mb-1 block">
              Email
            </label>
            <Input
              type="email"
              placeholder="user@email.com"
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
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Password"
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Role
            </label>
            <select
              className={`w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${errors.role
                  ? "border-red-500 focus-visible:ring-red-200"
                  : "border-input focus-visible:ring-ring"
                }`}
              {...register("role")}
            >
              <option value="">Select role</option>
              <option value="SYSTEM_ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
            </select>

            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600 mt-2">{errors.root.message}</p>
          )}

          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isPending ? "Creating User..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
