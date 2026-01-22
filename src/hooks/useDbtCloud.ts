import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

export interface DbtCloudConnection {
    id?: string;
    connection_name: string;
    account_id: string;
    base_url: string;
    created_at?: string;
    is_active?: boolean;
}

export const useGetDbtCloudConnections = () => {
    return useQuery({
        queryKey: ["dbt-cloud-connections"],
        queryFn: async () => {
            const res = await apiClient.get("/dbt-cloud/connections");
            return res.data;
        },
    });
};

export const useTestDbtCloudConnection = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post("/dbt-cloud/test-connection", data);
            return res.data;
        },
    });
};

export const useSaveDbtCloudConnection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post("/dbt-cloud/save-connection", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dbt-cloud-connections"] });
        },
    });
};

export const useDeleteDbtCloudConnection = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/dbt-cloud/connections/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dbt-cloud-connections"] });
        },
    });
};
