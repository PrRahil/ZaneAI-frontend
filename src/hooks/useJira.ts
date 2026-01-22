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

export const useGetJiraConnections = () =>
  useQuery({
    queryKey: ["jira-connections"],
    queryFn: async () => {
      const res = await apiClient.get("/jira/connections");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
