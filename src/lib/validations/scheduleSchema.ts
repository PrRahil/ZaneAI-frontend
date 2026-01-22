import { z } from "zod";

export const scheduleSchema = z.object({
    runs_every: z
        .string()
        .min(1, "Please select how often this should run"),

    cron_string: z
        .string()
        .min(1, "Cron string is required")
        .regex(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/, "Invalid cron string format (e.g. 30 16 * * *)"),

    timezone: z
        .string()
        .min(1, "Timezone is required"),
});

export type ScheduleSchemaType = z.infer<typeof scheduleSchema>;
