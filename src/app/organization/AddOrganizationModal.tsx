"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  organizationSchema,
  OrganizationSchemaType,
} from "@/lib/validations/organizationSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrganization } from "@/hooks/useOrganization";
import toast from "react-hot-toast";
import { parseErrorMessage } from "@/hooks/useAuth";

export default function AddOrganizationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
  });

  const { mutate, isPending } = useCreateOrganization();

  const onSubmit = (values: OrganizationSchemaType) => {
    mutate(values, {
      onSuccess: () => {
        toast.success("Organization created successfully!");
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
          <DialogTitle className="text-xl font-semibold">
            Create New Organization
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will create the organization and invite the first admin user.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Organization Name */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Organization Name</label>
            <Input
              placeholder="Enter organization name"
              error={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Admin Username */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Admin Username</label>
            <Input
              placeholder="Enter admin username"
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
            <label className="text-sm font-medium text-foreground mb-1 block">Admin Email</label>
            <Input
              placeholder="admin@example.com"
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
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
