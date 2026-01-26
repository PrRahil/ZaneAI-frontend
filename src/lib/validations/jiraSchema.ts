import { z } from "zod";

export const jiraConnectionSchema = z.object({
  connection_name: z
    .string()
    .min(2, "Connection name must be at least 2 characters")
    .max(50, "Connection name cannot exceed 50 characters"),

  server_url: z
    .string()
    .url("Server URL must be a valid URL")
    .min(1, "Server URL is required"),

  username: z
    .string()
    .min(1, "Username is required")
    .email("Username must be a valid email address")
    .max(100, "Username cannot exceed 100 characters"),

  api_token: z
    .string()
    .trim()
    .min(10, "API Token looks too short")
    .max(512, "API Token is invalid"),

});

export type JiraConnectionSchemaType = z.infer<typeof jiraConnectionSchema>;
