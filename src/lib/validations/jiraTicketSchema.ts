import { z } from "zod";

export const jiraTicketSchema = z.object({
  project_key: z.string().min(1, "Project is required"),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(255, "Summary cannot exceed 255 characters"),
  description: z.string().min(1, "Description is required"),
  issue_type: z.string().min(1, "Issue type is required"),
  priority: z.string().optional(),
  assignee: z.string().optional(),
});

export type JiraTicketSchemaType = z.infer<typeof jiraTicketSchema>;