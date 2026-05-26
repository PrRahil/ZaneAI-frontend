"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ExternalLink, Loader2, Ticket, AlertTriangle } from "lucide-react";

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
  CreateJiraTicketPayload,
} from "@/hooks/useJira";
import apiClient from "@/lib/apiClient";
import { parseErrorMessage } from "@/hooks/useAuth";
import {
  parseImpactByDepth,
  buildSingleTicketDescription,
  buildDepthTicketDescription,
  buildDepthTicketSummary,
  getPriorityForDepth,
  ImpactDepthSection,
} from "@/lib/impactDepthUtils";

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
import {
  AssigneeCombobox,
  UNASSIGNED,
} from "@/components/jira/AssigneeCombobox";

const JIRA_PRIORITIES = ["Highest", "High", "Medium", "Low", "Lowest"];

type TicketStrategy = "single" | "by_depth";

interface CreateJiraTicketModalProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: {
    summary?: string;
    description?: string;
    impact_analysis?: string;
    pr_url?: string;
    analysis_report_url?: string;
    affected_query_ids?: string[];
  };
}

export default function CreateJiraTicketModal({
  open,
  onClose,
  defaultValues,
}: CreateJiraTicketModalProps) {
  const [ticketStrategy, setTicketStrategy] = useState<TicketStrategy>("single");
  const [depthAssignees, setDepthAssignees] = useState<Record<number, string>>({});
  const [depthPriorities, setDepthPriorities] = useState<Record<number, string>>({});
  const [depthDescriptions, setDepthDescriptions] = useState<Record<number, string>>({});
  const [selectedDepths, setSelectedDepths] = useState<Set<number>>(new Set());
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsFetchError,
    refetch: refetchConnections,
  } = useGetJiraConnections(open);
  const connection = connections?.[0] ?? null;
  const connectionId = connection?.id ?? null;

  const parsedImpact = useMemo(
    () => parseImpactByDepth(defaultValues?.impact_analysis ?? ""),
    [defaultValues?.impact_analysis]
  );

  const canSplitByDepth = parsedImpact.depths.length > 1;

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
  const baseSummary = watch("summary");

  const {
    data: projects,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
    isError: projectsError,
    error: projectsFetchError,
    refetch: refetchProjects,
  } = useGetJiraProjects(connectionId);
  const projectsList = projects ?? [];
  // Deduplicate by key in case the API returns duplicates
  const uniqueProjectsList = projectsList.filter(
    (p, i, arr) => arr.findIndex((x) => x.key === p.key) === i
  );
  const projectsEmpty =
    !projectsLoading && !projectsFetching && !projectsError && uniqueProjectsList.length === 0;
  const projectsBlocked = projectsError || projectsEmpty;

  const {
    data: issueTypes,
    isLoading: issueTypesLoading,
    isError: issueTypesError,
    error: issueTypesFetchError,
    refetch: refetchIssueTypes,
  } = useGetJiraIssueTypes(connectionId, projectKey || null);
  const issueTypesList = issueTypes ?? [];
  const issueTypesEmpty =
    !!projectKey &&
    !issueTypesLoading &&
    !issueTypesError &&
    issueTypesList.length === 0;

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    error: usersFetchError,
    refetch: refetchUsers,
  } = useGetJiraUsers(connectionId, projectKey || null);

  const createTicket = useCreateJiraTicket();

  useEffect(() => {
    if (!open) return;

    const impactBody = buildSingleTicketDescription(
      parsedImpact.preamble,
      parsedImpact.depths,
      parsedImpact.epilogue
    );
    const fullDescription = [defaultValues?.description, impactBody]
      .filter(Boolean)
      .join("\n\n");

    reset({
      project_key: "",
      summary: defaultValues?.summary ?? "",
      description: fullDescription,
      issue_type: "",
      priority: "Medium",
      assignee: UNASSIGNED,
    });

    setTicketStrategy("single");
    setDepthAssignees(
      Object.fromEntries(
        parsedImpact.depths.map((d) => [d.depth, UNASSIGNED])
      )
    );
    setSelectedDepths(new Set(parsedImpact.depths.map((d) => d.depth)));
    setDepthPriorities(
      Object.fromEntries(
        parsedImpact.depths.map((d) => [
          d.depth,
          getPriorityForDepth(d.depth, parsedImpact.depths.length),
        ])
      )
    );
    setDepthDescriptions(
      Object.fromEntries(
        parsedImpact.depths.map((d) => [
          d.depth,
          buildDepthTicketDescription(
            parsedImpact.preamble,
            d,
            parsedImpact.epilogue
          ),
        ])
      )
    );
  }, [
    open,
    reset,
    defaultValues?.summary,
    defaultValues?.description,
    parsedImpact,
  ]);

  useEffect(() => {
    if (projectKey) {
      setValue("issue_type", "");
      setValue("assignee", UNASSIGNED);
      setDepthAssignees((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[Number(key)] = UNASSIGNED;
        }
        return next;
      });
      // priorities and descriptions are per-depth, not per-project — no reset needed
    }
  }, [projectKey, setValue]);

  useEffect(() => {
    if (issueTypesList.length === 1) {
      setValue("issue_type", issueTypesList[0].name);
    }
  }, [issueTypesList, setValue]);

  useEffect(() => {
    if (!canSplitByDepth && ticketStrategy === "by_depth") {
      setTicketStrategy("single");
    }
  }, [canSplitByDepth, ticketStrategy]);

  const resolveAssignee = (assignee: string | undefined) =>
    assignee && assignee !== UNASSIGNED ? assignee : undefined;

  const createDepthTickets = async (
    values: JiraTicketSchemaType
  ): Promise<{ key: string; url: string }[]> => {
    if (!connectionId) return [];

    const created: { key: string; url: string }[] = [];
    const createdByDepth: Record<number, { key: string; url: string }> = {};

    // Only create tickets for depths the user has selected
    const depthsToCreate = parsedImpact.depths.filter((d) =>
      selectedDepths.has(d.depth)
    );

    // Step 1: create tickets in depth order using apiClient directly to
    // avoid React Query mutation caching the previous result across loop iterations.
    for (let i = 0; i < depthsToCreate.length; i++) {
      const depth = depthsToCreate[i];
      const body = depthDescriptions[depth.depth] ?? buildDepthTicketDescription(
        parsedImpact.preamble,
        depth,
        parsedImpact.epilogue
      );
      const description = buildJiraTicketDescription(
        body,
        defaultValues?.pr_url,
        defaultValues?.analysis_report_url,
        defaultValues?.affected_query_ids
      );

      const parentTicket = createdByDepth[depth.depth - 1];

      const payload: CreateJiraTicketPayload = {
        connection_id: connectionId,
        project_key: values.project_key,
        summary: buildDepthTicketSummary(baseSummary || values.summary, depth.depth),
        description,
        issue_type: values.issue_type,
        priority: depthPriorities[depth.depth] ?? getPriorityForDepth(depth.depth, parsedImpact.depths.length),
        assignee: resolveAssignee(depthAssignees[depth.depth]),
        // Pass the upstream ticket key so the backend can link at creation time
        // Only link if the immediate parent depth (depth.depth - 1) was also created in this batch
        ...(parentTicket ? {
          linked_issue_key: parentTicket.key,
          link_type: "Relates",
        } : {}),
      };

      const res = await apiClient.post("/jira/create-ticket", payload);
      const result = res.data;
      const ticketInfo = { key: result.ticket_key, url: result.ticket_url };
      
      created.push(ticketInfo);
      createdByDepth[depth.depth] = ticketInfo;
    }

    return created;
  };

  const onSubmit = async (values: JiraTicketSchemaType) => {
    if (!connectionId) return;

    try {
      if (ticketStrategy === "by_depth") {
        setIsCreatingBulk(true);
        let created: { key: string; url: string }[] = [];
        try {
          created = await createDepthTickets(values);
        } finally {
          setIsCreatingBulk(false);
        }

        if (created.length > 0) {
          toast.success(
            <span>
              {created.length} tickets created:{" "}
              {created.map((t, i) => (
                <span key={`${t.key}-${i}`}>
                  {i > 0 && ", "}
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    {t.key}
                  </a>
                </span>
              ))}
            </span>
          );
        }
      } else {
        const data = await createTicket.mutateAsync({
          connection_id: connectionId,
          project_key: values.project_key,
          summary: values.summary,
          description: buildJiraTicketDescription(
            values.description,
            defaultValues?.pr_url,
            defaultValues?.analysis_report_url,
            defaultValues?.affected_query_ids
          ),
          issue_type: values.issue_type,
          priority: values.priority || undefined,
          assignee: resolveAssignee(values.assignee),
        });

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
      }
      onClose();
    } catch (error) {
      setIsCreatingBulk(false);
      const message = parseErrorMessage(error);
      toast.error(message || "Failed to create Jira ticket");
      setError("root", { message });
    }
  };

  const isSubmitting =
    ticketStrategy === "by_depth"
      ? isCreatingBulk
      : createTicket.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
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
        ) : connectionsError ? (
          <ResourceFetchAlert
            variant="error"
            title="Failed to load Jira connection"
            message={
              parseErrorMessage(connectionsFetchError) ||
              "Could not load your Jira connection. Please try again."
            }
            onRetry={() => refetchConnections()}
          />
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

            {canSplitByDepth && (
              <div className="space-y-2">
                <Label>Ticket strategy</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                      ticketStrategy === "single"
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="ticketStrategy"
                      value="single"
                      checked={ticketStrategy === "single"}
                      onChange={() => setTicketStrategy("single")}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium">Single ticket</p>
                      <p className="text-xs text-muted-foreground">
                        All {parsedImpact.depths.length} depth levels in one
                        ticket
                      </p>
                    </div>
                  </label>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                      ticketStrategy === "by_depth"
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-muted/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="ticketStrategy"
                      value="by_depth"
                      checked={ticketStrategy === "by_depth"}
                      onChange={() => setTicketStrategy("by_depth")}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium">Split by depth</p>
                      <p className="text-xs text-muted-foreground">
                        {parsedImpact.depths.length} separate tickets, one per
                        level
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

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
                    disabled={projectsLoading || projectsFetching || projectsBlocked}
                  >
                    <SelectTrigger
                      className={cn(
                        errors.project_key ? "border-red-500" : "",
                        projectsBlocked && "border-amber-500"
                      )}
                    >
                      <SelectValue
                        placeholder={
                          projectsLoading || projectsFetching
                            ? "Loading projects..."
                            : projectsError
                              ? "Failed to load projects"
                              : projectsEmpty
                                ? "No projects available"
                                : "Select project"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueProjectsList.map((p, i) => (
                        <SelectItem key={`${p.key}-${i}`} value={p.key}>
                          {p.name} ({p.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {projectsError && (
                <ResourceFetchAlert
                  variant="error"
                  title="Failed to load Jira projects"
                  message={
                    parseErrorMessage(projectsFetchError) ||
                    "We couldn't fetch projects from Jira. Check your connection and permissions, then retry."
                  }
                  onRetry={() => refetchProjects()}
                />
              )}
              {projectsEmpty && (
                <ResourceFetchAlert
                  variant="warning"
                  title="No Jira projects found"
                  message="Your Jira connection is active, but no projects were returned. Verify the API token has access to at least one project, or reconnect Jira in Settings."
                  onRetry={() => refetchProjects()}
                  retryLabel="Retry"
                  secondaryAction={
                    <Button asChild variant="outline" size="sm">
                      <Link href="/settings/connectors">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Go to Connectors
                      </Link>
                    </Button>
                  }
                />
              )}
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
                    disabled={
                      !projectKey ||
                      issueTypesLoading ||
                      issueTypesError ||
                      issueTypesEmpty
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        errors.issue_type ? "border-red-500" : "",
                        (issueTypesError || issueTypesEmpty) && "border-amber-500"
                      )}
                    >
                      <SelectValue
                        placeholder={
                          !projectKey
                            ? "Select a project first"
                            : issueTypesLoading
                              ? "Loading issue types..."
                              : issueTypesError
                                ? "Failed to load issue types"
                                : issueTypesEmpty
                                  ? "No issue types available"
                                  : "Select issue type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypesList.map((it) => (
                        <SelectItem key={it.id} value={it.name}>
                          {it.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {projectKey && issueTypesError && (
                <ResourceFetchAlert
                  variant="error"
                  title="Failed to load issue types"
                  message={
                    parseErrorMessage(issueTypesFetchError) ||
                    "We couldn't fetch issue types for this project."
                  }
                  onRetry={() => refetchIssueTypes()}
                />
              )}
              {projectKey && issueTypesEmpty && (
                <ResourceFetchAlert
                  variant="warning"
                  title="No issue types found"
                  message="This project has no creatable issue types. Choose a different project or check Jira project settings."
                  onRetry={() => refetchIssueTypes()}
                />
              )}
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
              {ticketStrategy === "by_depth" && (
                <p className="text-xs text-muted-foreground">
                  Each ticket will be prefixed with [Depth N]
                </p>
              )}
            </div>

            {ticketStrategy === "single" && (
              <>
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
                    <p className="text-red-500 text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
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
                        <AssigneeCombobox
                          value={field.value ?? UNASSIGNED}
                          onChange={field.onChange}
                          users={usersError ? [] : users}
                          disabled={!projectKey || usersLoading || usersError}
                          placeholder={
                            !projectKey
                              ? "Select a project first"
                              : usersLoading
                                ? "Loading users..."
                                : usersError
                                  ? "Failed to load users"
                                  : "Unassigned"
                          }
                        />
                      )}
                    />
                  </div>
                </div>
                {projectKey && usersError && (
                  <ResourceFetchAlert
                    variant="error"
                    title="Failed to load assignees"
                    message={
                      parseErrorMessage(usersFetchError) ||
                      "We couldn't fetch assignable users for this project."
                    }
                    onRetry={() => refetchUsers()}
                  />
                )}
              </>
            )}

            {ticketStrategy === "by_depth" && (
              <DepthTicketTable
                depths={parsedImpact.depths}
                selectedDepths={selectedDepths}
                onToggleDepth={(depth) =>
                  setSelectedDepths((prev) => {
                    const next = new Set(prev);
                    if (next.has(depth)) next.delete(depth);
                    else next.add(depth);
                    return next;
                  })
                }
                depthAssignees={depthAssignees}
                onAssigneeChange={(depth, assignee) =>
                  setDepthAssignees((prev) => ({ ...prev, [depth]: assignee }))
                }
                depthPriorities={depthPriorities}
                onPriorityChange={(depth, priority) =>
                  setDepthPriorities((prev) => ({ ...prev, [depth]: priority }))
                }
                depthDescriptions={depthDescriptions}
                onDescriptionChange={(depth, description) =>
                  setDepthDescriptions((prev) => ({ ...prev, [depth]: description }))
                }
                users={usersError ? [] : users}
                usersLoading={usersLoading}
                usersError={usersError}
                usersFetchError={usersFetchError}
                onRetryUsers={() => refetchUsers()}
                projectSelected={!!projectKey}
              />
            )}

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
                disabled={
                  isSubmitting ||
                  projectsLoading ||
                  projectsFetching ||
                  projectsBlocked ||
                  (!!projectKey && (issueTypesError || issueTypesEmpty)) ||
                  (ticketStrategy === "by_depth" && selectedDepths.size === 0)
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {ticketStrategy === "by_depth"
                      ? `Creating ${selectedDepths.size} tickets...`
                      : "Creating..."}
                  </>
                ) : ticketStrategy === "by_depth" ? (
                  selectedDepths.size === 0
                    ? "Select at least one depth"
                    : `Create ${selectedDepths.size} Ticket${selectedDepths.size > 1 ? "s" : ""}`
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

function DepthTicketTable({
  depths,
  selectedDepths,
  onToggleDepth,
  depthAssignees,
  onAssigneeChange,
  depthPriorities,
  onPriorityChange,
  depthDescriptions,
  onDescriptionChange,
  users,
  usersLoading,
  usersError,
  usersFetchError,
  onRetryUsers,
  projectSelected,
}: {
  depths: ImpactDepthSection[];
  selectedDepths: Set<number>;
  onToggleDepth: (depth: number) => void;
  depthAssignees: Record<number, string>;
  onAssigneeChange: (depth: number, assignee: string) => void;
  depthPriorities: Record<number, string>;
  onPriorityChange: (depth: number, priority: string) => void;
  depthDescriptions: Record<number, string>;
  onDescriptionChange: (depth: number, description: string) => void;
  users: ReturnType<typeof useGetJiraUsers>["data"];
  usersLoading: boolean;
  usersError?: boolean;
  usersFetchError?: unknown;
  onRetryUsers?: () => void;
  projectSelected: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tickets by depth level</Label>
        <span className="text-xs text-muted-foreground">
          {selectedDepths.size} of {depths.length} selected
        </span>
      </div>

      {depths.map((depth) => {
        const isSelected = selectedDepths.has(depth.depth);
        return (
          <div
            key={depth.depth}
            className={cn(
              "rounded-md border p-3 space-y-3 transition-colors",
              isSelected ? "bg-muted/20" : "bg-muted/5 opacity-60"
            )}
          >
            {/* Header row with checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleDepth(depth.depth)}
                  className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                />
                <span className="text-sm font-semibold">Depth {depth.depth}</span>
              </label>
              <span className="text-xs text-muted-foreground">
                {depth.itemCount} impacted
              </span>
            </div>

            {/* Priority + Assignee — only interactive when selected */}
            <div className={cn("grid grid-cols-2 gap-3", !isSelected && "pointer-events-none")}>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select
                  value={depthPriorities[depth.depth] ?? getPriorityForDepth(depth.depth, depths.length)}
                  onValueChange={(val) => onPriorityChange(depth.depth, val)}
                  disabled={!isSelected}
                >
                  <SelectTrigger className="h-9">
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
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Assignee</Label>
                <AssigneeCombobox
                  value={depthAssignees[depth.depth] ?? UNASSIGNED}
                  onChange={(val) => onAssigneeChange(depth.depth, val)}
                  users={users}
                  disabled={!isSelected || !projectSelected || usersLoading || usersError}
                  placeholder={
                    !projectSelected
                      ? "Select project first"
                      : usersLoading
                        ? "Loading..."
                        : usersError
                          ? "Failed to load users"
                          : "Unassigned"
                  }
                  className="h-9"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <textarea
                rows={4}
                value={depthDescriptions[depth.depth] ?? ""}
                onChange={(e) => onDescriptionChange(depth.depth, e.target.value)}
                disabled={!isSelected}
                placeholder="Ticket description for this depth level"
                className={cn(
                  "flex w-full rounded-md px-3 py-2 text-sm bg-background",
                  "border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "placeholder:text-muted-foreground resize-y min-h-[80px]",
                  !isSelected && "cursor-not-allowed opacity-50"
                )}
              />
            </div>
          </div>
        );
      })}

      {projectSelected && usersError && onRetryUsers && (
        <ResourceFetchAlert
          variant="error"
          title="Failed to load assignees"
          message={
            parseErrorMessage(usersFetchError) ||
            "We couldn't fetch assignable users for this project."
          }
          onRetry={onRetryUsers}
        />
      )}
      <p className="text-xs text-muted-foreground">
        Each ticket includes the change summary, that depth&apos;s impacted
        columns, affected query IDs, and a link to the pull request.
      </p>
    </div>
  );
}

function ResourceFetchAlert({
  variant,
  title,
  message,
  onRetry,
  retryLabel = "Retry",
  secondaryAction,
}: {
  variant: "error" | "warning";
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  secondaryAction?: ReactNode;
}) {
  const isError = variant === "error";

  return (
    <div
      className={cn(
        "rounded-md border px-3 py-3 text-sm",
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          className={cn(
            "h-4 w-4 mt-0.5 shrink-0",
            isError ? "text-red-600" : "text-amber-600"
          )}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium">{title}</p>
          <p className="text-xs leading-relaxed opacity-90">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 bg-background"
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
            {secondaryAction}
          </div>
        </div>
      </div>
    </div>
  );
}
