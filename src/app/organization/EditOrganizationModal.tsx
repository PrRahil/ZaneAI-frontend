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
import { zodResolver } from "@hookform/resolvers/zod";
import { editOrganizationSchema } from "@/lib/validations/organizationSchemas";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Pencil } from "lucide-react";
import { useUpdateOrganization } from "@/hooks/useOrganization";
import { parseErrorMessage } from "@/hooks/useAuth";

export default function EditOrganizationModal({
  open,
  onClose,
  org,
}: {
  open: boolean;
  onClose: () => void;
  org: { id: string; name: string } | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<{ name: string }>({
    resolver: zodResolver(editOrganizationSchema),
  });

  const { mutate, isPending } = useUpdateOrganization();

  useEffect(() => {
    if (org) {
      reset({ name: org.name });
    }
  }, [org, reset]);

  if (!org) return null;

  const onSubmit = (values: { name: string }) => {
    mutate(
      { id: org.id, name: values.name },
      {
        onSuccess: () => {
          toast.success("Organization updated!");
          onClose();
        },
        onError: (error: any) => {
          const message = parseErrorMessage(error);
          toast.error(message);
          setError("root", { message });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Organization
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Organization Name
            </label>
            <Input 
              {...register("name")} 
              placeholder="Enter new name" 
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
