import { z } from "zod";

export const dbtCloudSchema = z.object({
    connection_name: z
        .string()
        .trim()
        .min(3, "Connection name must be at least 3 characters")
        .max(50, "Connection name cannot exceed 50 characters")
        .regex(
            /^[a-zA-Z0-9 _-]+$/,
            "Connection name can contain only letters, numbers, spaces, _ and -"
        ),

    api_key: z
        .string()
        .trim()
        .min(20, "Service Token / API Key looks too short")
        .max(200, "Service Token / API Key is too long")
        .regex(/^\S+$/, "API Key must not contain spaces"),

    account_id: z
        .string()
        .trim()
        .regex(/^\d+$/, "Account ID must be a numeric value"),

    base_url: z
        .string()
        .trim()
        .url("Base URL must be a valid URL")
        .refine(
            (url) => url.startsWith("https://"),
            "Base URL must start with https://"
        )
        .refine(
            (url) =>
                url.includes("getdbt.com") || url.includes("dbt.com"),
            "Base URL must be a valid dbt Cloud URL"
        ),
});

export type DbtCloudSchemaType = z.infer<typeof dbtCloudSchema>;
