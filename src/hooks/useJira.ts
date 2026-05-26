import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { JiraConnectionSchemaType } from "@/lib/validations/jiraSchema";
import { parseErrorMessage } from "./useAuth";

export const useTestJiraConnection = () =>
  useMutation<any, Error, JiraConnectionSchemaType>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/jira/test-connection", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Test Jira connection error:", parseErrorMessage(error));
    },
  });

export const useSaveJiraConnection = () =>
  useMutation<any, Error, JiraConnectionSchemaType>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/jira/save-connection", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Save Jira connection error:", parseErrorMessage(error));
    },
  });

export const useDeleteJiraConnection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/jira/connections/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jira-connections"] });
    },
    onError: (error) => {
      console.error("Delete Jira connection error:", parseErrorMessage(error));
    },
  });
};

export type JiraConnection = {
  id: string;
  connection_name: string;
  jira_url?: string;
};

export type JiraProject = { key: string; name: string; id: string };
export type JiraIssueType = { id: string; name: string; description: string };
export type JiraAssignableUser = {
  account_id: string;
  name: string;
  email: string;
  active: boolean;
};

function normalizeJiraList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of [
      "projects",
      "issue_types",
      "users",
      "connections",
      "data",
      "results",
    ]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

export type CreateJiraTicketPayload = {
  connection_id: string;
  project_key: string;
  summary: string;
  description: string;
  issue_type?: string;
  priority?: string;
  assignee?: string;
  linked_issue_key?: string; // upstream ticket key — backend links at creation time
  link_type?: string;        // defaults to "Relates" on the backend
};

export const useGetJiraConnections = (enabled = true) =>
  useQuery<JiraConnection[]>({
    queryKey: ["jira-connections"],
    queryFn: async () => {
      const res = await apiClient.get("/jira/connections");
      return normalizeJiraList<JiraConnection>(res.data);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

export const useGetJiraProjects = (connectionId: string | null) =>
  useQuery<JiraProject[]>({
    queryKey: ["jira-projects", connectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/jira/projects/${connectionId}`);
      return normalizeJiraList<JiraProject>(res.data);
    },
    enabled: !!connectionId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });

export const useGetJiraIssueTypes = (
  connectionId: string | null,
  projectKey: string | null
) =>
  useQuery<JiraIssueType[]>({
    queryKey: ["jira-issue-types", connectionId, projectKey],
    queryFn: async () => {
      const res = await apiClient.get(
        `/jira/issue-types/${connectionId}/${projectKey}`
      );
      return normalizeJiraList<JiraIssueType>(res.data);
    },
    enabled: !!connectionId && !!projectKey,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useGetJiraUsers = (
  connectionId: string | null,
  projectKey: string | null
) =>
  useQuery<JiraAssignableUser[]>({
    queryKey: ["jira-users", connectionId, projectKey],
    queryFn: async () => {
      const params = projectKey ? { project_key: projectKey } : {};
      const res = await apiClient.get(`/jira/users/${connectionId}`, { params });
      return normalizeJiraList<JiraAssignableUser>(res.data);
    },
    enabled: !!connectionId && !!projectKey,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useCreateJiraTicket = () =>
  useMutation<any, Error, CreateJiraTicketPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/jira/create-ticket", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Create Jira ticket error:", parseErrorMessage(error));
    },
  });
