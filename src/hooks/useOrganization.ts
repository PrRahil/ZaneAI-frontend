import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { parseErrorMessage } from "./useAuth";

export type OrganizationResponse = {
  total_organizations: number;
  total_users: number;
  organizations: {
    organization: {
      id: string;
      name: string;
      is_active: boolean;
    };
    role_counts: {
      PRODUCT_SUPPORT_ADMIN: number;
      SYSTEM_ADMIN: number;
      ORGANIZATION_ADMIN: number;
      MEMBER: number;
      total: number;
    };
    users: any[];
  }[];
};

export type CreateOrganizationPayload = {
  name: string;
  username: string;
  email: string;
};

export const useOrganizations = () =>
  useQuery<OrganizationResponse>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await apiClient.get("/organizations/kpi");
      return res.data;
    },
    staleTime: 1000 * 30,
    retry: 1,
  });

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrganizationPayload) => {
      const res = await apiClient.post("/organizations/", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },

    onError: (error) => {
      console.error("create organization error:", parseErrorMessage(error));
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await apiClient.put(`/organizations/${id}`, { name });
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },

    onError: (error) => {
      console.error("Update organization error:", parseErrorMessage(error));
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/organizations/${id}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },

    onError: (error) => {
      console.error("Delete organization error:", parseErrorMessage(error));
    },
  });
};
