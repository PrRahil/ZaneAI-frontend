import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(3, "Organization name is required"),
  username: z.string()
      .min(3, "Admin name must be at least 3 characters")
      .regex(/^[A-Za-z ]+$/, "Admin name can only contain letters and spaces"),
  email: z
    .string()
    .email("Enter a valid email")
    .min(1, "Admin email is required"),
});
 
export const editOrganizationSchema = z.object({
  name: z.string().min(3, "Organization name is required"),
});

export type OrganizationSchemaType = z.infer<typeof organizationSchema>;
