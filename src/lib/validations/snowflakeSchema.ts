import { z } from "zod";

const CRON_REGEX =
  /^(\*|([0-5]?\d)(\/\d+)?|([0-5]?\d-[0-5]?\d))( (\*|([01]?\d|2[0-3])(\/\d+)?|([01]?\d|2[0-3]-[01]?\d|2[0-3]))){1}( (\*|([1-9]|[12]\d|3[01])(\/\d+)?|([1-9]|[12]\d|3[01]-[1-9]|[12]\d|3[01]))){1}( (\*|(1[0-2]|[1-9])(\/\d+)?|(1[0-2]|[1-9]-(1[0-2]|[1-9])))){1}( (\*|[0-7](\/\d+)?|[0-7]-[0-7]))$/;

export const snowflakeConnectionSchema = z.object({
  connectionName: z
    .string()
    .min(2, "Connection name must be at least 2 characters")
    .max(50, "Connection name cannot exceed 50 characters"),

  account: z
    .string()
    .min(2, "Account is required")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Account must contain only letters, numbers, hyphens, or underscores"
    )
    .max(100, "Account cannot exceed 100 characters"),

  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username cannot exceed 100 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include one uppercase letter")
    .regex(/[0-9]/, "Must include one number"),

  warehouse: z
    .string()
    .min(1, "Warehouse is required")
    .regex(/^[A-Za-z0-9_]+$/, "Warehouse must be alphanumeric (with underscores)")
    .max(100, "Warehouse cannot exceed 100 characters"),

  role: z
    .string()
    .min(1, "Role is required")
    .regex(/^[A-Za-z0-9_]+$/, "Role must be alphanumeric (with underscores)")
    .max(100, "Role cannot exceed 100 characters"),

  cron_expression: z
    .string()
    .min(1, "Cron expression is required")
    .max(100, "Cron expression cannot exceed 100 characters")
    .refine(
      (value) => {
        const parts = value.trim().split(/\s+/);
        return parts.length === 5 || parts.length === 6;
      },
      {
        message: "Cron must have 5 or 6 fields (e.g. * * * * *)",
      }
    )
    .refine(
      (value) => CRON_REGEX.test(value),
      {
        message: "Invalid cron expression format",
      }
    ),
});

export type SnowflakeConnectionSchemaType = z.infer<typeof snowflakeConnectionSchema>;
