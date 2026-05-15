"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ExternalLink, Loader2, Ticket } from "lucide-react";

import {
  jiraTicketSchema,
  JiraTicketSchemaType,
} from "@/lib/validations/jiraTicketSchema";
import {
  useGetJiraConnections,
  useGetJiraProjects,
  useGetJiraIssueTypes,
  useGetJiraUsers,
  useCreateJiraTicket,
} from "@/hooks/useJira";
import { parseErrorMessage } from "@/hooks/useAuth";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { buildJiraTicketDescription } from "@/lib/jiraDescriptionUtils";

const JIRA_PRIORITIES = ["Highest", "High", "Medium", "Low", "Lowest"];

const UNASSIGNED = "__unassigned__";

interface CreateJiraTicketModalProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    summary?: string;
    description?: string;
    pr_url?: string;
    analysis_report_url?: string;
  };
}

export default function CreateJiraTicketModal({
  open,
  onClose,
  defaultValues,
}: CreateJiraTicketModalProps) {
  const { data: connections, isLoading: connectionsLoading } =
    useGetJiraConnections();
  const connection = connections?.[0] ?? null;
  const connectionId = connection?.id ?? null;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<JiraTicketSchemaType>({
    resolver: zodResolver(jiraTicketSchema),
    defaultValues: {
      project_key: "",
      summary: "",
      description: "",
      issue_type: "",
      priority: "Medium",
      assignee: UNASSIGNED,
    },
  });

  const projectKey = watch("project_key");

  const { data: projects, isLoading: projectsLoading } =
    useGetJiraProjects(connectionId);
  const { data: issueTypes, isLoading: issueTypesLoading } =
    useGetJiraIssueTypes(connectionId, projectKey || null);
  const { data: users, isLoading: usersLoading } = useGetJiraUsers(
    connectionId,
    projectKey || null
  );

  const createTicket = useCreateJiraTicket();

  useEffect(() => {
    if (!open) return;
    reset({
      project_key: "",
      summary: defaultValues?.summary ?? "",
      description: defaultValues?.description ?? "",
      issue_type: "",
      priority: "Medium",
      assignee: UNASSIGNED,
    });
  }, [open, reset, defaultValues?.summary, defaultValues?.description]);

  useEffect(() => {
    if (projectKey) {
      setValue("issue_type", "");
      setValue("assignee", UNASSIGNED);
    }
  }, [projectKey, setValue]);

  useEffect(() => {
    if (issueTypes?.length === 1) {
      setValue("issue_type", issueTypes[0].name);
    }
  }, [issueTypes, setValue]);

  const onSubmit = (values: JiraTicketSchemaType) => {
    if (!connectionId) return;

    const description = buildJiraTicketDescription(
      values.description,
      defaultValues?.pr_url,
      defaultValues?.analysis_report_url
    );

    createTicket.mutate(
      {
        connection_id: connectionId,
        project_key: values.project_key,
        summary: values.summary,
        description,
        issue_type: values.issue_type,
        priority: values.priority || undefined,
        assignee:
          values.assignee && values.assignee !== UNASSIGNED
            ? values.assignee
            : undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(
            <span>
              Ticket{" "}
              <a
                href={data.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                {data.ticket_key}
              </a>{" "}
              created successfully!
            </span>
          );
          onClose();
        },
        onError: (error) => {
          const message = parseErrorMessage(error);
          toast.error(message || "Failed to create Jira ticket");
          setError("root", { message });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Create Jira Ticket
          </DialogTitle>
          <DialogDescription>
            Create a new issue in your connected Jira project.
          </DialogDescription>
        </DialogHeader>

        {connectionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !connection ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              No Jira connection found. Configure Jira in Settings before
              creating tickets.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/connectors">
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                Go to Connectors
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              Using connection:{" "}
              <span className="font-medium">{connection.connection_name}</span>
            </p>

            <div className="space-y-2">
              <Label>
                Project <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="project_key"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={projectsLoading}
                  >
                    <SelectTrigger
                      className={errors.project_key ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          projectsLoading
                            ? "Loading projects..."
                            : "Select project"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((p) => (
                        <SelectItem key={p.key} value={p.key}>
                          {p.name} ({p.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.project_key && (
                <p className="text-red-500 text-xs">
                  {errors.project_key.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Issue Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="issue_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!projectKey || issueTypesLoading}
                  >
                    <SelectTrigger
                      className={errors.issue_type ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          !projectKey
                            ? "Select a project first"
                            : issueTypesLoading
                              ? "Loading issue types..."
                              : "Select issue type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes?.map((it) => (
                        <SelectItem key={it.id} value={it.name}>
                          {it.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.issue_type && (
                <p className="text-red-500 text-xs">
                  {errors.issue_type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Summary <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Brief description of the issue"
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-red-500 text-xs">{errors.summary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                rows={5}
                placeholder="Detailed description of the issue, impact, and context"
                className={cn(
                  "flex w-full rounded-md px-3 py-2 text-sm bg-background",
                  "border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "placeholder:text-muted-foreground resize-y min-h-[100px]",
                  errors.description && "border-red-500"
                )}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {JIRA_PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Assignee</Label>
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!projectKey || usersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !projectKey
                              ? "Select a project first"
                              : usersLoading
                                ? "Loading users..."
                                : "Unassigned"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {users?.map((u) => (
                          <SelectItem key={u.account_id} value={u.account_id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {errors.root && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm border border-red-300">
                {errors.root.message}
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTicket.isPending || projectsLoading}
              >
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}