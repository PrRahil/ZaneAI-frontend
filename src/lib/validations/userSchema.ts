import * as z from "zod";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["SYSTEM_ADMIN", "PRODUCT_SUPPORT_ADMIN", "MEMBER"], {
    message: "Please select a valid role",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include one uppercase letter")
    .regex(/[0-9]/, "Must include one number")
});

export const editUserSchema = userSchema.omit({ password: true });

export type UserSchemaType = z.infer<typeof userSchema>;
export type EditUserSchemaType = z.infer<typeof editUserSchema>;
