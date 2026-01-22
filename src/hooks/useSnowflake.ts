import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { SnowflakeConnectionPayload } from "@/types/database";
import { parseErrorMessage } from "./useAuth";

export const useTestConnection = () =>
  useMutation<any, Error, SnowflakeConnectionPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/snowflake/test-connection", payload);
      return res.data;
    },
    onError: (error) => {
      console.error("Test connection error:", parseErrorMessage(error));
    },
  });

export const useSaveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, SnowflakeConnectionPayload>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/snowflake/save-connection", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snowflake-connections"] });
    },
    onError: (error) => {
      console.error("Save connection error:", parseErrorMessage(error));
    },
  });
};

export const useDeleteConnection = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const res = await apiClient.delete(`/snowflake/connections/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snowflake-connections"] });
    },
    onError: (error) => {
      console.error("Delete connection error:", parseErrorMessage(error));
    },
  });
};

export const useGetConnections = () =>
  useQuery({
    queryKey: ["snowflake-connections"],
    queryFn: async () => {
      const res = await apiClient.get("/snowflake/connections");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useFetchDatabases = (connectionId: string) =>
  useQuery({
    enabled: !!connectionId,
    queryKey: ["snowflake-databases", connectionId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/snowflake/fetch-databases/${connectionId}`
      );

      const data = res.data;
      const dbList = data?.databases ?? data ?? [];
      return (Array.isArray(dbList) ? dbList : []).map((db) => ({
        id: db,
        name: db,
      }));
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useFetchSchemas = () =>
  useMutation<any, Error, { connection_id: string; database_name: string }>({
    mutationFn: async ({ connection_id, database_name }) => {
      const res = await apiClient.get(
        `/snowflake/fetch-schemas/${connection_id}/${database_name}`
      );
      return res.data?.databases || [];
    },
    onError: (error) => {
      console.error("Fetch schemas error:", parseErrorMessage(error));
    },
  });

export const useFetchSchemasByDatabase = (
  connectionId: string,
  dbName: string
) =>
  useQuery({
    enabled: !!connectionId && !!dbName,
    queryKey: ["snowflake-schemas", connectionId, dbName],
    queryFn: async () => {
      const res = await apiClient.get(
        `/snowflake/fetch-schemas/${connectionId}/${dbName}`
      );

      const data = res.data;

      const list = Array.isArray(data?.schemas)
        ? data.schemas
        : Array.isArray(data)
          ? data
          : [];

      return list.map((schema: string) => ({
        id: `${dbName}.${schema}`,
        name: schema,
      }));
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const useSaveDatabaseSelection = () =>
  useMutation<any, Error, { connection_id: string; databases: string[] }>({
    mutationFn: async ({ connection_id, databases }) => {
      const res = await apiClient.post(
        `/snowflake/save-database-selection?connection_id=${connection_id}`,
        { database_names: databases }
      );
      return res.data;
    },
    onError: (error) => {
      console.error("Save database selection error:", parseErrorMessage(error));
    },
  });

export const useSaveSchemaSelection = () =>
  useMutation<any, Error, { connection_id: string; schemas: string[] }>({
    mutationFn: async ({ connection_id, schemas }) => {
      const groupedSchemas: Record<string, string[]> = {};

      for (const fullSchema of schemas) {
        const [database_name, schema_name] = fullSchema.split(".");
        if (!groupedSchemas[database_name]) {
          groupedSchemas[database_name] = [];
        }
        groupedSchemas[database_name].push(schema_name);
      }

      const responses = await Promise.all(
        Object.entries(groupedSchemas).map(([database_name, schema_names]) =>
          apiClient.post(
            `/snowflake/save-schema-selection?connection_id=${connection_id}`,
            {
              database_name,
              schema_names,
            }
          )
        )
      );

      return responses.map((r) => r.data);
    },

    onError: (error) => {
      console.error("Save schema selection error:", parseErrorMessage(error));
    },
  });
