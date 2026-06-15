import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiError } from "@/types/auth";
import { parseErrorMessage } from "@/hooks/useAuth";
import { UserSchemaType, EditUserSchemaType } from "@/lib/validations/userSchema";
import { useAuthStore } from "@/store/useAuthStore";

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  role: "SYSTEM_ADMIN" | "PRODUCT_SUPPORT_ADMIN" | "MEMBER";
  is_active: boolean;
};

export const useUsers = () =>
  useQuery<UserResponse[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const user = useAuthStore.getState().user;
      const ORG_ID = user?.org_id;

      if (!ORG_ID) throw new Error("Organization ID is missing.");

      const res = await apiClient.get(`/users?org_id=${ORG_ID}`);
      return res.data;
    },
    staleTime: 1000 * 30,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, ApiError, UserSchemaType>({
    mutationFn: async (data) => {
      const user = useAuthStore.getState().user;
      const ORG_ID = user?.org_id;

      if (!ORG_ID) throw new Error("Organization ID is missing.");

      const res = await apiClient.post(`/users/?org_id=${ORG_ID}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Create user error:", parseErrorMessage(error));
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UserResponse,
    ApiError,
    { id: string; data: EditUserSchemaType }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.put(`/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Update user error:", parseErrorMessage(error));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Delete user error:", parseErrorMessage(error));
    },
  });
};
