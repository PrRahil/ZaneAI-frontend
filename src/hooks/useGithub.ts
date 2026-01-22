import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { parseErrorMessage } from "./useAuth";

export const useGithubCallback = (installationId?: string) =>
  useQuery({
    enabled: !!installationId,
    queryKey: ["github-callback", installationId],
    queryFn: () =>
      apiClient
        .get("/github/callback", {
          params: { installation_id: installationId },
        })
        .then((res) => res.data),
  });

export const useGithubInstallations = () =>
  useQuery({
    queryKey: ["github-installations"],
    queryFn: () =>
      apiClient.get("/github/installations").then((res) => res.data),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

export const useGithubRepositories = (installationId?: string) =>
  useQuery({
    enabled: !!installationId,
    queryKey: ["github-repositories", installationId],
    queryFn: async () => {
      if (!installationId) throw new Error("Missing installation ID");

      const res = await apiClient.get(`/github/repositories/${installationId}`);
      return res.data;
    },
    retry: false,
  });

export const useGithubSyncRepositories = () =>
  useMutation({
    mutationFn: (payload: {
      installation_id: string;
      repositories: string[];
    }) =>
      apiClient
        .post(`/github/sync-repositories/${payload.installation_id}`, payload)
        .then((res) => res.data),

    onError: (error) => {
      console.error("Sync repositories error:", parseErrorMessage(error));
    },
  });

export const useGithubDeactivateInstallation = () =>
  useMutation({
    mutationFn: async (installation_id: string) => {
      const res = await apiClient.delete(
        `/github/installations/${installation_id}`
      );
      return res.data;
    },
    onError: (error) => {
      console.error("Deactivate installation error:", parseErrorMessage(error));
    },
  });

export const useGithubAnalyses = () =>
  useQuery({
    queryKey: ["github-analyses"],
    queryFn: async () => {
      const res = await apiClient.get("/overview-dashboard");
      return res.data;
    },
    retry: false,
  });

export const useGithubAnalysis = (analysisId?: string) =>
  useQuery({
    enabled: !!analysisId,
    queryKey: ["github-analysis", analysisId],
    queryFn: async () => {
      const res = await apiClient.get(`/github/analyses/${analysisId}`);
      return res.data;
    },
    retry: false,
  });

export const useGithubProcessPR = () =>
  useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post(`/github/process-pr`, payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Process PR error:", parseErrorMessage(error));
    },
  });
