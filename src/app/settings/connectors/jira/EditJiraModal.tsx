"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import {
  jiraConnectionSchema,
  JiraConnectionSchemaType,
} from "@/lib/validations/jiraSchema";

import {
  useTestJiraConnection,
  useSaveJiraConnection,
} from "@/hooks/useJira";

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

interface EditJiraModalProps {
  open: boolean;
  onClose: () => void;
  connectionData: any;
}

export default function EditJiraModal({
  open,
  onClose,
  connectionData,
}: EditJiraModalProps) {
  const testConnection = useTestJiraConnection();
  const saveConnection = useSaveJiraConnection();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<JiraConnectionSchemaType>({
    resolver: zodResolver(jiraConnectionSchema),
  });

  useEffect(() => {
    if (open) {
      if (connectionData) {
        setValue("connection_name", connectionData.connection_name || "Jira Connection");
        setValue("server_url", connectionData.server_url || connectionData.url || "");
        setValue("username", connectionData.username || "");
        setValue("api_token", "");
        setValue("project_key", connectionData.project_key || "");
        setValue("issue_type", connectionData.issue_type || "Bug");
      } else {
        reset();
        setValue("connection_name", "Jira Connection");
      }
    }
  }, [connectionData, open, setValue, reset]);

  const onSubmit = (values: JiraConnectionSchemaType) => {
    const payload = values;

    testConnection.mutate(payload, {
      onSuccess: () => {
        saveConnection.mutate(payload, {
          onSuccess: (data) => {
            toast.success("Jira connection saved successfully!");
            onClose();
          },
          onError: (error) => {
            const message = parseErrorMessage(error);
            toast.error("Failed to save Jira connection");
            setError("root", { message });
          },
        });
      },
      onError: (error) => {
        const msg = parseErrorMessage(error);
        setError("root", { message: msg });
        toast.error(msg || "Jira Connection test failed");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{connectionData ? "Edit" : "Add"} Jira Connection</DialogTitle>
          <DialogDescription>
            Configure your Jira integration for issue tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Connection Name</Label>
              <Input
                placeholder="My Jira"
                {...register("connection_name")}
              />
              {errors.connection_name && <p className="text-red-500 text-sm">{errors.connection_name.message}</p>}
            </div>

            <div>
              <Label>Server URL</Label>
              <Input
                placeholder="https://your-domain.atlassian.net"
                {...register("server_url")}
              />
              {errors.server_url && <p className="text-red-500 text-sm">{errors.server_url.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username (Email)</Label>
                <Input
                  placeholder="email@example.com"
                  {...register("username")}
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
              <div>
                <Label>API Token</Label>
                <Input
                  type="password"
                  placeholder="Atlassian API Token"
                  {...register("api_token")}
                />
                {errors.api_token && <p className="text-red-500 text-sm">{errors.api_token.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project Key</Label>
                <Input
                  placeholder="PROJ"
                  {...register("project_key")}
                />
                {errors.project_key && <p className="text-red-500 text-sm">{errors.project_key.message}</p>}
              </div>
              <div>
                <Label>Issue Type</Label>
                <Input
                  placeholder="Bug"
                  {...register("issue_type")}
                />
                {errors.issue_type && <p className="text-red-500 text-sm">{errors.issue_type.message}</p>}
              </div>
            </div>
          </div>

          {errors.root && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm border border-red-300">
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={testConnection.isPending || saveConnection.isPending}>
              {testConnection.isPending
                ? "Testing..."
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
