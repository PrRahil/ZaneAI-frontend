"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Database } from "lucide-react";

import {
  snowflakeConnectionSchema,
  SnowflakeConnectionSchemaType,
} from "@/lib/validations/snowflakeSchema";
import { explainCron } from "@/lib/cronUtils";

import {
  useTestConnection,
  useSaveConnection,
} from "@/hooks/useSnowflake";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseErrorMessage } from "@/hooks/useAuth";

interface EditSnowflakeModalProps {
  open: boolean;
  onClose: () => void;
  connectionData: any;
}

export default function EditSnowflakeModal({
  open,
  onClose,
  connectionData,
}: EditSnowflakeModalProps) {
  const testConnection = useTestConnection();
  const saveConnection = useSaveConnection();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<SnowflakeConnectionSchemaType>({
    resolver: zodResolver(snowflakeConnectionSchema),
  });

  useEffect(() => {
    if (connectionData && open) {
      // Pre-fill form
      setValue("connectionName", connectionData.connection_name || connectionData.name || "");
      setValue("account", connectionData.account || "");
      setValue("username", connectionData.username || "");
      setValue("warehouse", connectionData.warehouse || "");
      setValue("role", connectionData.role || "");
      setValue("cron_expression", connectionData.cron_expression || "* * * * *");
      setValue("password", "");
    } else if (!open) {
      reset();
    }
  }, [connectionData, open, setValue, reset]);

  const onSubmit = (values: SnowflakeConnectionSchemaType) => {
    const payload = {
      connection_name: values.connectionName,
      account: values.account,
      username: values.username,
      password: values.password,
      warehouse: values.warehouse,
      role: values.role,
      cron_expression: values.cron_expression,
    };

    testConnection.mutate(payload, {
      onSuccess: () => {
        saveConnection.mutate(payload, {
          onSuccess: (data) => {
            toast.success("Connection saved successfully!");
            onClose();
          },
          onError: (error) => {
            const message = parseErrorMessage(error);
            toast.error("Failed to save connection");
            setError("root", { message });
          },
        });
      },
      onError: (error) => {
        const msg = parseErrorMessage(error);
        setError("root", { message: msg });
        toast.error(msg || "Connection test failed");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            {connectionData ? "Edit" : "Add"} Snowflake Connection
          </DialogTitle>
          <DialogDescription>
            {connectionData
              ? "Update your Snowflake connection details."
              : "Configure your Snowflake data warehouse connection."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Connection Name
              </Label>
              <Input
                placeholder="My Snowflake"
                {...register("connectionName")}
              />
              {errors.connectionName && (
                <p className="text-red-500 text-sm">{errors.connectionName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Account
                </Label>
                <Input
                  placeholder="account.region.cloud (e.g., xy12345.us-east-1)"
                  {...register("account")}
                />
                {errors.account && (
                  <p className="text-red-500 text-sm">{errors.account.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Username
                </Label>
                <Input
                  placeholder="snowflake_user"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder={connectionData ? "Enter new password to update" : "Enter password"}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Warehouse
                </Label>
                <Input
                  placeholder="COMPUTE_WH"
                  {...register("warehouse")}
                />
                {errors.warehouse && (
                  <p className="text-red-500 text-sm">{errors.warehouse.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Role
                </Label>
                <Input
                  placeholder="ACCOUNTADMIN"
                  {...register("role")}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Cron Expression
                </Label>
                <Input
                  placeholder="* * * * *"
                  {...register("cron_expression")}
                />
                <div className="text-[11px] text-muted-foreground mt-1 h-4">
                  {explainCron(watch("cron_expression") || "")}
                </div>
                {errors.cron_expression && (
                  <p className="text-red-500 text-sm">{errors.cron_expression.message}</p>
                )}
              </div>
            </div>
          </div>

          {errors.root && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={testConnection.isPending || saveConnection.isPending}
            >
              {testConnection.isPending
                ? "Testing Connection..."
                : saveConnection.isPending
                  ? "Saving..."
                  : "Save Connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
